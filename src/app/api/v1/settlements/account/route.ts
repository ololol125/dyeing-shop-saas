import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { encryptAccountNumber, isEncryptionConfigured } from "@/lib/settlement";

export const dynamic = "force-dynamic";

const BUSINESS_TYPES = ["INDIVIDUAL", "CORPORATE"];

async function findOwnerShop(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user?.userId) return { error: NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 }) };
  const shop = await prisma.shop.findFirst({ where: { ownerId: user.userId } });
  if (!shop) {
    return { error: NextResponse.json({ success: false, error: "등록된 매장이 없습니다. 매장을 먼저 등록해 주세요." }, { status: 404 }) };
  }
  return { shop };
}

// 정산 계좌 조회 (GET): 계좌번호는 끝 4자리만 내려준다
export async function GET(req: NextRequest) {
  try {
    const { shop, error } = await findOwnerShop(req);
    if (error) return error;

    const account = await prisma.shopSettlementAccount.findUnique({ where: { shopId: shop.shopId } });
    return NextResponse.json({
      success: true,
      data: account
        ? {
            ownerName: account.ownerName,
            businessType: account.businessType,
            bankName: account.bankName,
            accountNumberLast4: account.accountNumberLast4,
            accountHolder: account.accountHolder,
            updatedAt: account.updatedAt,
          }
        : null,
    });
  } catch (err) {
    console.error("🚨 정산 계좌 조회 에러:", err);
    return NextResponse.json({ success: false, error: "정산 계좌 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

// 정산 계좌 등록·변경 (PUT)
export async function PUT(req: NextRequest) {
  try {
    const { shop, error } = await findOwnerShop(req);
    if (error) return error;

    if (!isEncryptionConfigured()) {
      return NextResponse.json(
        { success: false, error: "정산 계좌 저장 설정이 아직 완료되지 않았습니다. 고객센터로 문의해 주세요." },
        { status: 503 },
      );
    }

    const body = await req.json();
    const ownerName = String(body.ownerName ?? "").trim();
    const businessType = String(body.businessType ?? "");
    const bankName = String(body.bankName ?? "").trim();
    const accountHolder = String(body.accountHolder ?? "").trim();
    const accountNumber = String(body.accountNumber ?? "").replace(/[^0-9]/g, "");

    if (!ownerName || !bankName || !accountHolder || !BUSINESS_TYPES.includes(businessType)) {
      return NextResponse.json({ success: false, error: "빠진 항목이 있어요. 모든 칸을 채워 주세요." }, { status: 400 });
    }
    if (accountNumber.length < 8 || accountNumber.length > 20) {
      return NextResponse.json({ success: false, error: "계좌번호를 다시 확인해 주세요. (숫자 8~20자리)" }, { status: 400 });
    }

    const data = {
      ownerName,
      businessType,
      bankName,
      accountHolder,
      accountNumberEnc: encryptAccountNumber(accountNumber),
      accountNumberLast4: accountNumber.slice(-4),
    };
    await prisma.shopSettlementAccount.upsert({
      where: { shopId: shop.shopId },
      create: { shopId: shop.shopId, ...data },
      update: data,
    });

    return NextResponse.json({ success: true, message: "정산 계좌를 저장했습니다." });
  } catch (err) {
    console.error("🚨 정산 계좌 저장 에러:", err);
    return NextResponse.json({ success: false, error: "정산 계좌를 저장하지 못했습니다." }, { status: 500 });
  }
}
