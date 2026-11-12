import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import {
  formatRate,
  getMonthlySettlements,
  getSettlementLines,
  getShopCommissionBps,
  kstMonthBounds,
} from "@/lib/settlement";

export const dynamic = "force-dynamic";

// 정산 내역 조회 (GET)
// - 파라미터 없음: 월별 정산 요약 + 현재 수수료율 + 계좌 등록 여부
// - ?month=2026-11: 그 달의 결제 건별 내역
export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user?.userId) {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.userId } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장이 없습니다. 매장을 먼저 등록해 주세요." },
        { status: 404 },
      );
    }

    const month = req.nextUrl.searchParams.get("month");
    if (month) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return NextResponse.json({ success: false, error: "조회할 달이 올바르지 않습니다." }, { status: 400 });
      }
      const lines = await getSettlementLines(shop, kstMonthBounds(month));
      return NextResponse.json({ success: true, data: { month, lines } });
    }

    const [months, currentBps, account] = await Promise.all([
      getMonthlySettlements(shop),
      getShopCommissionBps(shop),
      prisma.shopSettlementAccount.findUnique({
        where: { shopId: shop.shopId },
        select: { bankName: true, accountNumberLast4: true, accountHolder: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        commissionRateBps: currentBps,
        commissionRateText: formatRate(currentBps),
        account,
        months,
      },
    });
  } catch (err) {
    console.error("🚨 정산 내역 조회 에러:", err);
    return NextResponse.json({ success: false, error: "정산 내역을 불러오지 못했습니다." }, { status: 500 });
  }
}
