import { PaymentClient } from "@portone/server-sdk";
import { prisma } from "@/lib/prisma";

// 포트원 V2 REST API 클라이언트 (API Secret은 서버에서만 사용)
export const portone = PaymentClient({
  secret: process.env.PORTONE_API_SECRET ?? "",
});

export type FinalizeResult =
  | { ok: true; reservationId: number }
  | { ok: false; reason: "NOT_FOUND" | "NOT_PAID" | "MISMATCH"; message: string };

/**
 * 포트원에서 실제 결제 상태를 조회해 검증한 뒤 예약을 확정한다.
 * 앱의 결제 완료 요청(/payments/complete)과 포트원 웹훅이 모두 이 함수를 호출하므로
 * 여러 번 호출되어도 예약은 한 번만 생성되도록 멱등하게 동작한다.
 */
export async function finalizePayment(paymentId: string): Promise<FinalizeResult> {
  const record = await prisma.payment.findUnique({ where: { paymentId } });
  if (!record) {
    return { ok: false, reason: "NOT_FOUND", message: "결제 정보를 찾을 수 없습니다." };
  }
  if (record.status === "PAID" && record.reservationId) {
    return { ok: true, reservationId: record.reservationId };
  }

  // 클라이언트가 보낸 결과는 신뢰하지 않고, 포트원 서버에서 결제 건을 직접 조회한다.
  const payment = await portone.getPayment({ paymentId });

  if (payment.status !== "PAID") {
    if (payment.status === "FAILED" || payment.status === "CANCELLED") {
      await prisma.payment.updateMany({
        where: { paymentId, status: "READY" },
        data: { status: "FAILED" },
      });
    }
    return { ok: false, reason: "NOT_PAID", message: "결제가 완료되지 않았습니다." };
  }

  // 결제 금액/통화가 서버에서 계산한 금액과 다르면 위변조로 보고 즉시 환불한다.
  if (payment.amount.total !== record.amount || payment.currency !== "KRW") {
    await portone.cancelPayment({ paymentId, reason: "결제 금액 불일치" });
    await prisma.payment.update({ where: { paymentId }, data: { status: "FAILED" } });
    return { ok: false, reason: "MISMATCH", message: "결제 금액이 일치하지 않아 결제가 취소되었습니다." };
  }

  const reservationId = await prisma.$transaction(async (tx) => {
    // PAID 전환에 성공한 요청만 예약을 생성한다 (웹훅과 앱 요청의 동시 처리 대비).
    // 결제창 오류로 FAILED 처리된 뒤 같은 paymentId로 재결제된 경우도 확정할 수 있도록 FAILED도 허용한다.
    const claimed = await tx.payment.updateMany({
      where: { paymentId, status: { in: ["READY", "FAILED"] } },
      data: { status: "PAID", paidAt: new Date(payment.paidAt) },
    });
    if (claimed.count === 0) {
      const current = await tx.payment.findUnique({ where: { paymentId } });
      return current?.reservationId ?? null;
    }

    const reservation = await tx.reservation.create({
      data: {
        shopId: record.shopId,
        clientId: record.clientId,
        reservationTime: record.reservationTime,
        menuType: record.menuType,
        totalAmount: record.amount,
        status: "CONFIRMED",
        notes: record.notes,
      },
    });

    await tx.assignedTo.create({
      data: {
        reservationId: reservation.reservationId,
        designerId: record.designerId,
      },
    });

    await tx.payment.update({
      where: { paymentId },
      data: { reservationId: reservation.reservationId },
    });

    return reservation.reservationId;
  });

  if (reservationId === null) {
    return { ok: false, reason: "NOT_PAID", message: "결제 처리 상태를 확인할 수 없습니다." };
  }
  return { ok: true, reservationId };
}
