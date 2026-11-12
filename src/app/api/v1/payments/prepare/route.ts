import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { portone } from "@/lib/portone";

export const dynamic = "force-dynamic";

const MENU_LABELS: Record<string, string> = {
  ROOT_DYE: "뿌리 염색",
  FULL_DYE: "전체 염색",
};

// 앱에서 선택한 결제수단 → 포트원 결제수단 코드 / 채널 키
const PAY_METHODS: Record<string, { payMethod: string; channelKey?: string }> = {
  CARD: { payMethod: "CARD", channelKey: process.env.PORTONE_CHANNEL_KEY_INICIS },
  KAKAOPAY: { payMethod: "EASY_PAY", channelKey: process.env.PORTONE_CHANNEL_KEY_KAKAOPAY },
};

// 결제 준비 (POST): 결제 금액을 서버에서 계산하고 포트원에 사전 등록한 뒤,
// 앱이 결제창을 띄우는 데 필요한 정보(paymentId, 금액, 채널 키 등)를 내려준다.
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "인증 토큰이 누락되었거나 유효하지 않습니다." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { shopId, designerId, reservationTime, menuType, notes, payMethod } = body;

    if (!shopId || !designerId || !reservationTime || !MENU_LABELS[menuType]) {
      return NextResponse.json(
        { success: false, error: "필수 예약 정보가 누락되었습니다." },
        { status: 400 },
      );
    }

    const method = PAY_METHODS[payMethod ?? "CARD"];
    if (!method) {
      return NextResponse.json(
        { success: false, error: "지원하지 않는 결제수단입니다." },
        { status: 400 },
      );
    }
    if (!process.env.PORTONE_STORE_ID || !method.channelKey) {
      return NextResponse.json(
        { success: false, error: "결제 설정이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요." },
        { status: 503 },
      );
    }

    const time = new Date(reservationTime);
    if (Number.isNaN(time.getTime()) || time.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: "예약 일시가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const [shop, designer, client] = await Promise.all([
      prisma.shop.findUnique({ where: { shopId: Number(shopId) } }),
      prisma.designer.findUnique({ where: { designerId: Number(designerId) } }),
      prisma.appUser.findUnique({ where: { userId: decoded.userId } }),
    ]);

    if (!shop || !designer || designer.shopId !== shop.shopId || designer.isActive === false) {
      return NextResponse.json(
        { success: false, error: "매장 또는 디자이너 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }
    if (!client) {
      return NextResponse.json(
        { success: false, error: "사용자 정보를 찾을 수 없습니다." },
        { status: 401 },
      );
    }

    // 결제 금액은 앱이 보낸 값이 아닌 매장의 현재 가격으로 결정한다.
    const amount = menuType === "ROOT_DYE" ? shop.rootPrice : shop.fullPrice;
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "결제 금액이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const paymentId = `rsv-${randomUUID()}`;
    const orderName = `${shop.shopName} ${MENU_LABELS[menuType]}`;

    await prisma.payment.create({
      data: {
        paymentId,
        clientId: client.userId,
        shopId: shop.shopId,
        designerId: designer.designerId,
        reservationTime: time,
        menuType,
        notes: notes || null,
        orderName,
        amount,
      },
    });

    // 포트원에 결제 금액을 사전 등록해, 결제창에서 금액이 변조되면 결제 자체가 거절되도록 한다.
    await portone.preRegisterPayment({ paymentId, totalAmount: amount, currency: "KRW" });

    return NextResponse.json(
      {
        success: true,
        data: {
          storeId: process.env.PORTONE_STORE_ID,
          channelKey: method.channelKey,
          payMethod: method.payMethod,
          paymentId,
          orderName,
          totalAmount: amount,
          customer: {
            fullName: client.name,
            phoneNumber: client.phone,
            email: client.email,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🚨 결제 준비 에러:", error);
    return NextResponse.json(
      { success: false, error: "결제 준비 중 서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
