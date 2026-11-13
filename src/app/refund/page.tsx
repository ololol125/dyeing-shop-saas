import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "취소·환불 규정 | 염색온",
};

// 예약 시점별 환불 비율 (이용약관 제12조와 같은 내용)
const REFUND_RULES = [
  { when: "예약 시간 24시간 전까지 취소", refund: "결제 금액 전액 환불" },
  { when: "예약 시간 24시간 이내 취소", refund: "결제 금액의 50% 환불" },
  { when: "예약 시간 이후 취소 또는 노쇼", refund: "환불 불가" },
  { when: "매장 사정으로 예약 취소", refund: "결제 금액 전액 환불" },
];

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인으로</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          취소·환불 규정
        </h1>
        <p className="mt-2 text-xs text-slate-400">시행일: 2026년 11월 13일</p>

        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. 결제 안내</h2>
            <p>
              염색온 앱에서 예약할 때 매장이 정한 시술 요금(뿌리 염색, 전체 염색 등)을
              신용카드 또는 카카오페이로 미리 결제합니다. 결제가 완료되면 예약이
              확정됩니다. 머리 길이나 추가 시술에 따라 매장에서 추가 요금이 생길 수
              있으며, 추가 요금은 매장에서 직접 결제합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">2. 취소 시점별 환불 금액</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-bold">취소 시점</th>
                    <th className="px-4 py-3 font-bold">환불 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {REFUND_RULES.map((rule) => (
                    <tr key={rule.when} className="border-t border-slate-200">
                      <td className="px-4 py-3">{rule.when}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{rule.refund}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. 취소 방법</h2>
            <p>
              예약한 매장에 전화하거나 염색온 고객센터(
              <a href={`tel:${BUSINESS.phone}`} className="font-semibold text-violet-600 underline">
                {BUSINESS.phone}
              </a>
              , 평일 10:00~18:00)로 연락하시면 취소해 드립니다. 취소 시점은 매장 또는
              고객센터에 취소를 요청한 시각을 기준으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. 환불 처리 기간</h2>
            <p>
              환불은 취소가 확인된 날부터 3영업일 이내에 결제한 수단으로 결제를 취소하는
              방식으로 처리합니다. 카드 결제는 카드사 사정에 따라 승인 취소가 반영되기까지
              3~7영업일이 걸릴 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. 시술 후 불만</h2>
            <p>
              시술 결과에 대한 문의나 재시술 요청은 해당 매장과 먼저 상의해 주세요.
              매장과 해결되지 않으면 고객센터로 연락 주시면 함께 해결을 돕겠습니다.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100 text-xs text-slate-400">
            <p>상호명: {BUSINESS.name}</p>
            <p>대표자: {BUSINESS.ceo}</p>
            <p>사업자등록번호: {BUSINESS.registrationNumber}</p>
            {BUSINESS.mailOrderNumber && <p>통신판매업 신고번호: {BUSINESS.mailOrderNumber}</p>}
            <p>사업장주소: {BUSINESS.address}</p>
            <p>전화번호: {BUSINESS.phone}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
