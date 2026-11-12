import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { finalizePayment } from "@/lib/portone";

export const dynamic = "force-dynamic";

// 결제 완료 처리 (POST): 앱에서 결제창이 닫힌 뒤 호출.
// 포트원에서 결제 건을 직접 조회해 검증하고, 검증에 성공하면 예약을 확정한다.
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "인증 토큰이 누락되었거나 유효하지 않습니다." },
        { status: 401 },
      );
    }

    const { paymentId } = await req.json();
    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        { success: false, error: "paymentId가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 본인의 결제 건만 완료 처리할 수 있다.
    const record = await prisma.payment.findUnique({ where: { paymentId } });
    if (!record || record.clientId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: "결제 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const result = await finalizePayment(paymentId);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.message, reason: result.reason },
        { status: result.reason === "NOT_FOUND" ? 404 : 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "결제가 완료되어 예약이 확정되었습니다.",
        data: { reservationId: result.reservationId },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("🚨 결제 완료 처리 에러:", error);
    return NextResponse.json(
      { success: false, error: "결제 확인 중 서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
