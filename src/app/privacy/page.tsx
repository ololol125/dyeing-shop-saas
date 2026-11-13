import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "개인정보처리방침 | 염색온",
};

export default function PrivacyPage() {
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
          개인정보처리방침
        </h1>
        <p className="mt-2 text-xs text-slate-400">시행일: 2026년 8월 26일</p>

        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
          <p>
            주식회사 씨엘엠티(이하 &ldquo;회사&rdquo;)는 「개인정보보호법」
            등 관련 법령을 준수하며, 회사가 제공하는 염색·헤어숍 예약 및
            매장 운영 관리 서비스 &ldquo;염색온&rdquo;(이하
            &ldquo;서비스&rdquo;)을 이용하는 정보주체의 개인정보를 안전하게
            처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              1. 수집하는 개인정보 항목 및 수집방법
            </h2>
            <p className="mb-2">
              회사는 회원가입, 매장 등록, 예약 및 서비스 이용 과정에서
              아래와 같은 개인정보를 수집합니다.
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>회원가입(공통): 이름, 이메일 주소, 비밀번호, 전화번호</li>
              <li>
                파트너(매장 오너): 매장명, 사업자등록번호, 사업장 주소,
                매장 전화번호, 매장 위치정보(위도·경도), 매장 소개 및 게시물
                이미지
              </li>
              <li>
                예약/시술 이용 고객: 이름, 연락처, 예약 및 시술 이력 정보
              </li>
              <li>
                결제: 결제 금액, 결제 일시, 결제 수단 종류 (카드번호 등 결제
                수단 정보는 결제대행사가 직접 처리하며 회사는 저장하지
                않습니다)
              </li>
              <li>
                파트너 정산: 대표자명, 사업자 종류, 정산 계좌 정보(은행명,
                계좌번호, 예금주). 계좌번호는 암호화하여 보관합니다.
              </li>
              <li>
                서비스 이용 과정에서 자동으로 생성되어 수집되는 정보: 접속
                로그, 서비스 이용 기록
              </li>
            </ul>
            <p className="mt-2">
              수집방법: 회원가입 및 정보 수정 화면을 통한 입력, 매장 등록
              및 게시물 등록 화면을 통한 입력
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              2. 개인정보의 수집 및 이용목적
            </h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
              <li>매장 예약 접수, 확정, 변경, 취소 등 예약 서비스 제공</li>
              <li>매장 정보 및 게시물의 소비자 앱 노출·운영</li>
              <li>예약 대금 결제 처리 및 파트너 매장 정산 금액 산정·지급</li>
              <li>고객 문의 응대 및 서비스 관련 공지사항 전달</li>
              <li>서비스 부정이용 방지 및 이용약관 위반 회원에 대한 조치</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              3. 개인정보의 보유 및 이용기간
            </h2>
            <p>
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는
              해당 정보를 지체 없이 파기합니다. 다만, 관계 법령에 따라
              보존할 필요가 있는 경우 회사는 아래와 같이 관계 법령에서
              정한 일정한 기간 동안 회원정보를 보관합니다.
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
              <li>로그인 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              4. 개인정보의 파기절차 및 방법
            </h2>
            <p>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
              불필요하게 되었을 때에는 지체 없이 해당 개인정보를
              파기합니다. 전자적 파일 형태의 정보는 복구 및 재생이
              불가능한 기술적 방법을 사용하여 삭제하며, 종이에 출력된
              개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              5. 개인정보의 제3자 제공
            </h2>
            <p>
              회사는 정보주체의 개인정보를 원칙적으로 외부에 제공하지
              않습니다. 다만, 정보주체의 사전 동의가 있거나 법령의 규정에
              의거한 경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              6. 개인정보 처리의 위탁
            </h2>
            <p>
              회사는 서비스 운영을 위하여 아래와 같이 개인정보 처리업무를
              외부 업체에 위탁하고 있으며, 관계 법령에 따라 위탁계약 시
              개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고
              있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>수탁업체: Vercel Inc. / Supabase Inc. — 위탁업무: 서비스 인프라 호스팅 및 데이터베이스·이미지 저장</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              7. 정보주체의 권리·의무 및 행사방법
            </h2>
            <p>
              정보주체는 회사에 대해 언제든지 자신의 개인정보 열람, 정정,
              삭제, 처리정지를 요구할 수 있으며, 회사는 이에 대해 지체 없이
              조치합니다. 권리 행사는 아래 개인정보 보호책임자에게 서면,
              전화, 이메일 등을 통하여 하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              8. 개인정보의 안전성 확보조치
            </h2>
            <p>
              회사는 개인정보의 안전성 확보를 위해 비밀번호 암호화,
              접속기록 보관, 개인정보에 대한 접근 권한 제한, 데이터베이스
              접근 통제 등 기술적·관리적 조치를 취하고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              9. 개인정보 보호책임자
            </h2>
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
              개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을
              위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>성명: 채영훈 (대표자)</li>
              <li>연락처: 053-957-6388</li>
              <li>소속: 주식회사 씨엘엠티</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              10. 개인정보처리방침의 변경
            </h2>
            <p>
              이 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라
              내용의 추가·삭제 및 수정이 있을 시에는 시행 최소 7일 전부터
              서비스 내 공지사항을 통하여 고지할 것입니다.
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
