import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// ── 플랫폼 수수료율 ────────────────────────────────────
// 단위는 bp(1bp = 0.01%). 300 = 3%.
// 우선순위: 매장별 설정(shop.commission_rate_bps) → 플랫폼 기본값(platform_setting) → 환경변수 → 300
//
// 기본 수수료율 바꾸기 (DB에서 실행):
//   INSERT INTO platform_setting (key, value) VALUES ('commission_rate_bps', '250')
//   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
// 특정 매장만 바꾸기:
//   UPDATE shop SET commission_rate_bps = 200 WHERE shop_id = 1;
// 바뀐 수수료율은 그 이후 결제부터 적용된다 (지난 결제는 결제 시점 수수료율 유지).
export const COMMISSION_SETTING_KEY = "commission_rate_bps";
const FALLBACK_COMMISSION_BPS = 300;

export async function getDefaultCommissionBps(): Promise<number> {
  const row = await prisma.platformSetting.findUnique({ where: { key: COMMISSION_SETTING_KEY } });
  const fromDb = row ? Number(row.value) : NaN;
  if (Number.isInteger(fromDb) && fromDb >= 0 && fromDb <= 10000) return fromDb;

  const fromEnv = Number(process.env.PLATFORM_COMMISSION_RATE_BPS);
  if (Number.isInteger(fromEnv) && fromEnv >= 0 && fromEnv <= 10000) return fromEnv;

  return FALLBACK_COMMISSION_BPS;
}

export async function getShopCommissionBps(shop: { commissionRateBps: number | null }): Promise<number> {
  return shop.commissionRateBps ?? (await getDefaultCommissionBps());
}

// 수수료는 원 단위 반올림
export function commissionOf(amount: number, bps: number): number {
  return Math.round((amount * bps) / 10000);
}

// 300 → "3%", 250 → "2.5%"
export function formatRate(bps: number): string {
  return `${Number((bps / 100).toFixed(2))}%`;
}

// ── 계좌번호 암호화 (AES-256-GCM) ──────────────────────
// SETTLEMENT_ENCRYPTION_KEY: 32바이트 키를 base64로 (openssl rand -base64 32)
function encryptionKey(): Buffer {
  const raw = process.env.SETTLEMENT_ENCRYPTION_KEY;
  const key = raw ? Buffer.from(raw, "base64") : Buffer.alloc(0);
  if (key.length !== 32) {
    throw new Error("SETTLEMENT_ENCRYPTION_KEY가 설정되지 않았거나 길이가 올바르지 않습니다.");
  }
  return key;
}

export function isEncryptionConfigured(): boolean {
  try {
    encryptionKey();
    return true;
  } catch {
    return false;
  }
}

// 저장 형식: "v1:<iv>:<tag>:<암호문>" (모두 base64)
export function encryptAccountNumber(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptAccountNumber(stored: string): string {
  const [version, iv, tag, data] = stored.split(":");
  if (version !== "v1") throw new Error("알 수 없는 계좌번호 암호화 형식입니다.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

// ── 월별 정산 집계 ─────────────────────────────────────
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 결제 시각 → KST 기준 "YYYY-MM"
export function kstMonthKey(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().substring(0, 7);
}

// "2026-11" → 그 달의 KST 시작~끝 (UTC Date)
export function kstMonthBounds(month: string): { start: Date; end: Date } {
  const [y, m] = month.split("-").map(Number);
  const start = Date.UTC(y, m - 1, 1) - KST_OFFSET_MS;
  const end = Date.UTC(y, m, 1) - KST_OFFSET_MS - 1;
  return { start: new Date(start), end: new Date(end) };
}

export interface SettlementLine {
  paymentId: string;
  paidAt: string;
  customerName: string;
  orderName: string;
  menuType: string;
  amount: number;
  commissionRateBps: number;
  commission: number;
  net: number;
}

export interface MonthlySettlement {
  month: string; // "2026-11"
  paymentCount: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  // IN_PROGRESS: 이번 달(집계 중) / SCHEDULED: 지난달(지급 예정) / PAID: 지급 완료
  status: "IN_PROGRESS" | "SCHEDULED" | "PAID";
  paidAt: string | null;
}

// 매장의 결제 완료 건을 정산 줄로 변환 (결제 시점 수수료율 우선, 없으면 현재 수수료율)
export async function getSettlementLines(
  shop: { shopId: number; commissionRateBps: number | null },
  range?: { start: Date; end: Date },
): Promise<SettlementLine[]> {
  const currentBps = await getShopCommissionBps(shop);
  const payments = await prisma.payment.findMany({
    where: {
      shopId: shop.shopId,
      status: "PAID",
      ...(range ? { paidAt: { gte: range.start, lte: range.end } } : {}),
    },
    include: { client: { select: { name: true } } },
    orderBy: { paidAt: "desc" },
  });

  return payments
    .filter((p) => p.paidAt)
    .map((p) => {
      const bps = p.commissionRateBps ?? currentBps;
      const commission = commissionOf(p.amount, bps);
      return {
        paymentId: p.paymentId,
        paidAt: p.paidAt!.toISOString(),
        customerName: p.client.name,
        orderName: p.orderName,
        menuType: p.menuType,
        amount: p.amount,
        commissionRateBps: bps,
        commission,
        net: p.amount - commission,
      };
    });
}

export async function getMonthlySettlements(shop: {
  shopId: number;
  commissionRateBps: number | null;
}): Promise<MonthlySettlement[]> {
  const [lines, paidRecords] = await Promise.all([
    getSettlementLines(shop),
    prisma.settlement.findMany({ where: { shopId: shop.shopId } }),
  ]);
  const currentMonth = kstMonthKey(new Date());

  const byMonth = new Map<string, MonthlySettlement>();
  for (const line of lines) {
    const month = kstMonthKey(new Date(line.paidAt));
    const row =
      byMonth.get(month) ??
      ({ month, paymentCount: 0, grossAmount: 0, commissionAmount: 0, netAmount: 0, status: "SCHEDULED", paidAt: null } as MonthlySettlement);
    row.paymentCount += 1;
    row.grossAmount += line.amount;
    row.commissionAmount += line.commission;
    row.netAmount += line.net;
    byMonth.set(month, row);
  }

  // 이번 달은 항상 보여준다 (결제가 없어도 0원으로)
  if (!byMonth.has(currentMonth)) {
    byMonth.set(currentMonth, {
      month: currentMonth,
      paymentCount: 0,
      grossAmount: 0,
      commissionAmount: 0,
      netAmount: 0,
      status: "IN_PROGRESS",
      paidAt: null,
    });
  }

  for (const row of byMonth.values()) {
    const paid = paidRecords.find((r) => r.periodMonth === row.month);
    if (paid) {
      // 지급이 끝난 달은 지급 당시 확정 금액을 그대로 보여준다
      row.status = "PAID";
      row.paidAt = paid.paidAt?.toISOString() ?? null;
      row.paymentCount = paid.paymentCount;
      row.grossAmount = paid.grossAmount;
      row.commissionAmount = paid.commissionAmount;
      row.netAmount = paid.netAmount;
    } else {
      row.status = row.month === currentMonth ? "IN_PROGRESS" : "SCHEDULED";
    }
  }

  return [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month));
}
