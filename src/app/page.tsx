import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Phone,
  Smartphone,
  Store,
  UserSquare2,
  Users,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { BUSINESS } from "@/lib/business";

// 시작 페이지: 염색방 사장님 대상 (큰 글씨, 쉬운 말)

const benefits = [
  {
    icon: Phone,
    title: "전화 예약이 줄어요",
    description: "손님이 염색온 앱으로 날짜·시간·선생님을 골라 직접 예약해요.",
  },
  {
    icon: CreditCard,
    title: "결제까지 앱에서 끝나요",
    description: "예약할 때 카드·카카오페이로 미리 결제해서 노쇼 걱정이 줄어요.",
  },
  {
    icon: CalendarCheck,
    title: "오늘 예약이 한눈에",
    description: "들어온 예약을 시간 순서대로 보고, 시술이 끝나면 버튼 하나로 마감해요.",
  },
  {
    icon: Users,
    title: "손님 기록이 남아요",
    description: "쓴 염색약, 요청 사항을 메모해 두면 다음 방문 때 바로 꺼내 볼 수 있어요.",
  },
];

const steps = [
  { icon: UserSquare2, title: "사장님 회원가입", description: "이름, 휴대폰 번호, 이메일만 있으면 돼요." },
  { icon: Store, title: "매장 등록", description: "매장 이름, 주소, 가격을 적으면 손님 앱에 매장이 보여요." },
  { icon: CheckCircle2, title: "예약 받기 시작", description: "선생님을 등록하면 그날부터 예약을 받을 수 있어요." },
];

// 히어로 오른쪽: 사장님 화면 미리보기 (실제 데이터가 아닌 예시임을 표시)
const previewReservations = [
  { time: "오전 10:00", name: "김○○ 손님", menu: "뿌리 염색" },
  { time: "오후 1:00", name: "이○○ 손님", menu: "전체 염색" },
  { time: "오후 2:30", name: "박○○ 손님", menu: "뿌리 염색" },
];

const primaryCta =
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-control bg-brand px-7 text-button font-bold text-white hover:bg-brand-pressed";
const secondaryCta =
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-control border-2 border-brand bg-surface px-7 text-button font-bold text-brand hover:bg-brand-soft";

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      {/* 머리글 */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <Link href="/" aria-label="염색온 처음으로" className="shrink-0">
            <span className="sm:hidden">
              <Logo size={40} />
            </span>
            <span className="hidden sm:inline">
              <Logo size={44} subtitle="염색방 예약 관리" />
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-2">
            <Link
              href="/services"
              className="hidden min-h-touch items-center whitespace-nowrap px-3 text-body font-bold text-ink hover:text-brand md:inline-flex"
            >
              서비스 및 요금
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-touch items-center whitespace-nowrap rounded-control border-2 border-brand px-4 text-body font-bold text-brand hover:bg-brand-soft"
            >
              로그인
            </Link>
            {/* 휴대폰에서는 첫 화면의 큰 버튼을 쓰고, 넓은 화면에서만 머리글에 표시 */}
            <Link
              href="/signup"
              className="hidden min-h-touch items-center whitespace-nowrap rounded-control bg-brand px-5 text-button font-bold text-white hover:bg-brand-pressed sm:inline-flex"
            >
              무료로 시작하기
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* 첫 화면 */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-badge bg-brand-soft px-3 py-1.5 text-body font-bold text-brand">
              <Smartphone className="h-5 w-5" aria-hidden />
              염색방 사장님을 위한 예약 관리
            </p>
            <h1 className="text-[2.5rem] font-bold leading-tight text-ink md:text-[3.25rem]">
              우리 동네 염색방,
              <br />
              예약은 <span className="text-brand">염색온</span>으로
            </h1>
            <p className="mt-6 max-w-xl text-[1.25rem] leading-relaxed text-ink-sub">
              손님은 앱에서 예약하고 결제까지 마치고, 사장님은 컴퓨터나 휴대폰으로
              오늘 예약을 확인하세요. 어렵지 않게, 큰 글씨로 만들었어요.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={primaryCta}>
                무료로 매장 등록하기
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/login" className={secondaryCta}>
                사장님 로그인
              </Link>
            </div>
            <p className="mt-4 text-body text-ink-sub">가입과 매장 등록은 무료입니다.</p>
          </div>

          {/* 사장님 화면 미리보기 */}
          <div className="rounded-card border border-line bg-surface p-6" aria-label="사장님 화면 예시">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-heading font-bold text-ink">오늘 예약</p>
              <span className="rounded-badge bg-canvas px-3 py-1 text-caption font-semibold text-ink-sub">화면 예시</span>
            </div>
            <ul className="space-y-3">
              {previewReservations.map((r) => (
                <li key={r.time} className="flex items-center gap-4 rounded-control border border-line bg-canvas p-4">
                  <span className="w-28 shrink-0 text-heading font-bold tabular-nums text-ink">{r.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-bold text-ink">{r.name}</p>
                    <p className="text-body text-ink-sub">{r.menu}</p>
                  </div>
                  <span className="hidden items-center gap-1 rounded-badge border border-success/30 bg-success-soft px-3 py-1 text-caption font-bold text-success sm:inline-flex">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    결제 완료
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-2 rounded-control bg-brand-soft p-4 text-body font-semibold text-brand">
              <Wallet className="h-5 w-5" aria-hidden />
              예약할 때 미리 결제돼서 노쇼 걱정이 줄어요
            </div>
          </div>
        </section>

        {/* 좋아지는 점 */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
            <h2 className="text-center text-[2rem] font-bold text-ink">염색온을 쓰면 이렇게 편해져요</h2>
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4 rounded-card border border-line bg-canvas p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-control bg-brand text-white">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-heading font-bold text-ink">{title}</h3>
                    <p className="mt-2 text-body leading-relaxed text-ink-sub">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 시작 방법 */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <h2 className="text-center text-[2rem] font-bold text-ink">시작은 3단계면 충분해요</h2>
          <p className="mt-3 text-center text-[1.25rem] text-ink-sub">가입한 날부터 예약을 받을 수 있어요.</p>
          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, i) => (
              <li key={title} className="rounded-card border border-line bg-surface p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-heading font-bold text-white">
                    {i + 1}
                  </span>
                  <Icon className="h-7 w-7 text-brand" aria-hidden />
                </div>
                <h3 className="mt-4 text-heading font-bold text-ink">{title}</h3>
                <p className="mt-2 text-body leading-relaxed text-ink-sub">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 마지막 안내 */}
        <section className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
          <div className="flex flex-col items-center rounded-card bg-brand px-6 py-14 text-center">
            <LogoMark size={64} className="rounded-control ring-2 ring-white/40" />
            <h2 className="mt-6 text-[2rem] font-bold text-white">지금 매장을 등록해 보세요</h2>
            <p className="mt-3 max-w-xl text-[1.25rem] text-brand-soft">
              가입과 매장 등록은 무료입니다. 궁금한 점은 아래 전화번호로 연락 주세요.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex min-h-touch items-center gap-2 rounded-control bg-surface px-7 text-button font-bold text-brand hover:bg-brand-soft"
            >
              무료로 시작하기
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      {/* 바닥글 */}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <Logo size={36} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body">
            <Link href="/services" className="inline-flex min-h-touch items-center text-ink hover:text-brand">
              서비스 및 요금
            </Link>
            <Link href="/terms" className="inline-flex min-h-touch items-center text-ink hover:text-brand">
              이용약관
            </Link>
            <Link href="/privacy" className="inline-flex min-h-touch items-center font-bold text-ink underline underline-offset-4 hover:text-brand">
              개인정보처리방침
            </Link>
            <Link href="/refund" className="inline-flex min-h-touch items-center text-ink hover:text-brand">
              취소·환불 규정
            </Link>
          </div>
        </div>

        {/* 사업자 정보 (전자상거래법 필수 노출 사항) */}
        <div className="mx-auto max-w-6xl border-t border-line px-4 py-6 md:px-6">
          <p className="text-caption leading-relaxed text-ink-sub">
            상호명: {BUSINESS.name} · 대표자: {BUSINESS.ceo} · 사업자등록번호: {BUSINESS.registrationNumber}
            {BUSINESS.mailOrderNumber && <> · 통신판매업 신고번호: {BUSINESS.mailOrderNumber}</>}
            <br />
            사업장주소: {BUSINESS.address} · 전화번호:{" "}
            <a href={`tel:${BUSINESS.phone}`} className="font-semibold text-ink underline underline-offset-2">
              {BUSINESS.phone}
            </a>
            <br />© {new Date().getFullYear()} 염색온. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
