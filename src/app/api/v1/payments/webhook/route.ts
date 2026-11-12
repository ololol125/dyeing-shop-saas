import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "@portone/server-sdk";
import { finalizePayment } from "@/lib/portone";

export const dynamic = "force-dynamic";

// 포트원 웹훅 수신 (POST): 앱이 결제 직후 종료되는 등 /payments/complete 호출이 누락돼도
// 결제가 확정되도록 포트원 서버가 직접 알려주는 결제 상태 변경을 처리한다.
export async function POST(req: NextRequest) {
  // 서명 검증을 위해 body를 파싱하지 않은 문자열 그대로 사용해야 한다.
  const payload = await req.text();

  let webhook;
  try {
    webhook = await Webhook.verify(
      process.env.PORTONE_WEBHOOK_SECRET ?? "",
      payload,
      Object.fromEntries(req.headers),
    );
  } catch (error) {
    console.error("🚨 포트원 웹훅 검증 실패:", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    if (webhook.type === "Transaction.Paid") {
      const result = await finalizePayment(webhook.data.paymentId);
      // 이 앱에서 만든 결제 건이 아니면(NOT_FOUND) 무시한다.
      if (!result.ok && result.reason !== "NOT_FOUND") {
        console.error("🚨 웹훅 결제 확정 실패:", webhook.data.paymentId, result.message);
      }
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // 5xx를 반환하면 포트원이 웹훅을 재전송한다.
    console.error("🚨 포트원 웹훅 처리 에러:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
