import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "이용약관 | 염색온",
};

export default function TermsPage() {
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
          염색온 서비스 이용약관
        </h1>
        <p className="mt-2 text-xs text-slate-400">시행일: 2026년 8월 26일</p>

        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제1조 (목적)
            </h2>
            <p>
              이 약관은 주식회사 씨엘엠티(이하 &ldquo;회사&rdquo;)가 제공하는
              염색·헤어숍 예약 및 매장 운영 관리 서비스 &ldquo;염색온&rdquo;
              (이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와 이용자의
              권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로
              합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제2조 (정의)
            </h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>
                &ldquo;서비스&rdquo;란 회사가 제공하는 매장(파트너) 관리용
                SaaS 및 소비자용 애플리케이션을 통해 제공되는 예약, 매장
                정보 열람, 게시물 열람 등 일체의 서비스를 의미합니다.
              </li>
              <li>
                &ldquo;회원&rdquo;이란 이 약관에 동의하고 회사와 이용계약을
                체결하여 서비스를 이용하는 개인 또는 사업자를 말합니다.
              </li>
              <li>
                &ldquo;파트너(오너)&rdquo;란 매장 정보를 등록하고 서비스를
                통해 매장을 운영·관리하는 회원을 말합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제3조 (약관의 게시와 개정)
            </h2>
            <p>
              회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기
              화면 또는 연결화면을 통해 게시합니다. 회사는 관련 법령을
              위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시
              적용일자 및 개정사유를 명시하여 사전에 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제4조 (서비스의 제공 및 변경)
            </h2>
            <p>
              회사는 매장 예약 관리, 디자이너 관리, 고객 시술 이력 관리,
              매장 게시물 관리, 매장 정보 열람 등의 서비스를 제공합니다.
              회사는 운영상, 기술상의 필요에 따라 제공하는 서비스의 내용을
              변경할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제5조 (서비스의 중단)
            </h2>
            <p>
              회사는 시스템 점검, 교체, 고장, 통신 두절 등의 사유가
              발생하는 경우 서비스 제공을 일시적으로 중단할 수 있으며,
              사전에 공지 가능한 경우 이를 사전 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제6조 (회원가입 및 이용계약의 성립)
            </h2>
            <p>
              이용계약은 회원이 되고자 하는 자가 약관 내용에 동의하고 회사가
              정한 가입 양식에 따라 회원정보를 기입한 후 가입을 신청하고,
              회사가 이러한 신청에 대해 승낙함으로써 성립합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제7조 (회원 탈퇴 및 자격 상실)
            </h2>
            <p>
              회원은 언제든지 회사에 탈퇴를 요청할 수 있으며, 회사는 즉시
              회원 탈퇴를 처리합니다. 회원이 이 약관을 위반하거나 서비스의
              정상적인 운영을 방해한 경우 회사는 회원 자격을 제한 또는
              상실시킬 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제8조 (개인정보보호)
            </h2>
            <p>
              회사는 관계 법령이 정하는 바에 따라 회원의 개인정보를
              보호하기 위해 노력하며, 개인정보의 수집·이용·처리에 관한
              사항은 별도의{" "}
              <Link href="/privacy" className="text-violet-600 font-semibold hover:underline">
                개인정보처리방침
              </Link>
              에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제9조 (회사의 의무)
            </h2>
            <p>
              회사는 관련 법령과 이 약관이 금지하거나 미풍양속에 반하는
              행위를 하지 않으며, 계속적이고 안정적인 서비스 제공을 위해
              최선을 다합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제10조 (회원의 의무)
            </h2>
            <p>
              회원은 서비스 이용 시 관계 법령, 이 약관의 규정, 이용안내 및
              서비스와 관련하여 공지한 주의사항을 준수하여야 하며, 타인의
              정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제11조 (예약 및 결제)
            </h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>
                회원은 소비자용 애플리케이션에서 매장, 시술, 담당 디자이너,
                날짜와 시간을 선택하여 예약을 신청할 수 있습니다.
              </li>
              <li>
                예약은 회원이 신용카드 또는 간편결제(카카오페이 등)로 시술
                요금을 결제하여 결제가 완료된 때에 확정됩니다.
              </li>
              <li>
                결제는 회사가 지정한 전자결제대행사(PG)를 통해 처리되며,
                회사는 회원의 카드번호 등 결제수단 정보를 직접 저장하지
                않습니다.
              </li>
              <li>
                시술 요금은 매장이 정한 금액이 예약 화면에 표시되며, 시술
                현장에서 머리 길이나 추가 시술에 따라 매장과 회원이 협의하여
                추가 요금이 발생할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제12조 (예약 취소 및 환불)
            </h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>
                회원은 예약한 매장 또는 회사 고객센터(전화 053-957-6388)에
                연락하여 예약을 취소할 수 있습니다.
              </li>
              <li>
                환불 금액은 취소 시점에 따라 다음과 같습니다.
                <ul className="mt-1.5 ml-5 list-disc space-y-1">
                  <li>예약 시간 24시간 전까지 취소: 결제 금액 전액 환불</li>
                  <li>예약 시간 24시간 이내 취소: 결제 금액의 50% 환불</li>
                  <li>예약 시간 이후 취소 또는 연락 없이 방문하지 않은 경우(노쇼): 환불 불가</li>
                </ul>
              </li>
              <li>
                매장의 사정(휴업, 디자이너 부재 등)으로 예약이 취소되는 경우
                결제 금액 전액을 환불합니다.
              </li>
              <li>
                환불은 취소가 확인된 날부터 3영업일 이내에 결제한 수단으로
                결제를 취소하는 방식으로 처리하며, 실제 환급 시점은 카드사나
                결제사에 따라 달라질 수 있습니다.
              </li>
              <li>
                자세한 내용은{" "}
                <Link href="/refund" className="font-semibold text-violet-600 underline">
                  취소·환불 규정
                </Link>
                을 따릅니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              제13조 (분쟁해결 및 재판관할)
            </h2>
            <p>
              회사와 회원 간 발생한 분쟁에 관하여는 대한민국 법을 적용하며,
              분쟁으로 인한 소송이 제기되는 경우 민사소송법상의 관할 법원에
              제소합니다.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-2">부칙</h2>
            <p>이 약관은 2026년 8월 26일부터 시행합니다.</p>
            <p>개정: 2026년 11월 13일 (제11조 예약 및 결제, 제12조 예약 취소 및 환불 신설)</p>
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
