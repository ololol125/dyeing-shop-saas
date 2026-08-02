"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  Menu,
  X,
  CalendarDays,
  UserSquare2,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Smartphone,
  Star,
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "기능" },
    { href: "#workflow", label: "이용 흐름" },
    { href: "#pricing", label: "요금제" },
  ];

  const features = [
    {
      icon: CalendarDays,
      color: "violet",
      title: "예약 현황 관리",
      description:
        "실시간으로 들어오는 예약을 한눈에 확인하고, 확정·취소·노쇼까지 상태별로 관리하세요.",
    },
    {
      icon: UserSquare2,
      color: "purple",
      title: "디자이너 설정",
      description:
        "매장에 소속된 디자이너를 등록하고 개인별 스케줄과 실적을 개별적으로 관리할 수 있어요.",
    },
    {
      icon: Users,
      color: "emerald",
      title: "고객 시술 이력",
      description:
        "고객별 방문 기록과 시술 히스토리를 저장해 다음 방문 시에도 놓치지 않고 응대하세요.",
    },
    {
      icon: BarChart3,
      color: "amber",
      title: "매출 통계 대시보드",
      description:
        "이번 달 매출, 방문 손님 수, 디자이너별 실적 랭킹까지 대시보드에서 실시간으로 확인해요.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "매장 등록",
      description: "우리 매장 정보를 등록하고 파트너 계정을 개설해요.",
    },
    {
      step: "02",
      title: "디자이너 & 메뉴 설정",
      description: "소속 디자이너와 시술 메뉴를 등록해 예약을 받을 준비를 해요.",
    },
    {
      step: "03",
      title: "예약 접수 & 관리",
      description: "고객 예약을 접수하고 확정, 완료, 노쇼까지 상태를 관리해요.",
    },
    {
      step: "04",
      title: "데이터로 운영 개선",
      description: "매출·고객·디자이너 데이터를 바탕으로 매장 운영을 개선해요.",
    },
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden">
              <Image
                src="/icon01.png"
                alt="염색온"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-black tracking-tight text-slate-900">
                염색온
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="flex items-center space-x-1.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2.5 rounded-xl shadow-md shadow-violet-600/20 transition-all"
            >
              <span>무료로 시작하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-medium text-slate-600 py-1.5"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                href="/login"
                className="text-center text-sm font-semibold text-slate-600 py-2.5 rounded-xl border border-slate-200"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-center text-sm font-bold text-white bg-violet-600 py-2.5 rounded-xl"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-white">
          <div className="absolute top-0 left-0 w-[28rem] h-[28rem] bg-purple-300/70 rounded-full blur-2xl" />
          <div className="absolute top-10 right-0 w-[26rem] h-[26rem] bg-violet-300/70 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-300/60 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200/60 rounded-full blur-2xl" />
          <div className="absolute inset-0 bg-white/40" />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>염색·헤어숍 사장님을 위한 매장 운영 SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            예약부터 매출까지,
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              염색온
            </span>{" "}
            하나로 관리하세요
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            예약 접수, 디자이너 스케줄, 고객 시술 이력, 매출 통계까지 —
            흩어져 있던 매장 운영을 하나의 대시보드에서 처리하는
            파트너 전용 관리 솔루션입니다.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-6 py-3.5 rounded-xl shadow-lg shadow-violet-600/25 transition-all"
            >
              <span>무료로 매장 등록하기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              <span>파트너 로그인</span>
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-400 font-medium">
            신용카드 등록 없이 바로 시작할 수 있어요
          </p>
        </div>
      </section>

      {/* 신뢰 지표 바 */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              실시간
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              예약 · 매출 데이터 반영
            </p>
          </div>
          <div className="border-x border-slate-200">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              올인원
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              매장 운영 통합 관리
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              무료 시작
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              부담 없는 파트너 가입
            </p>
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
            Features
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            매장 운영에 꼭 필요한 기능만
          </h2>
          <p className="mt-4 text-slate-500 leading-relaxed">
            예약장부와 엑셀 대신, 염색방 하나로 매장의 모든 흐름을
            관리해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-7 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${colorMap[feature.color]}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 이용 흐름 섹션 */}
      <section id="workflow" className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
              Workflow
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              시작은 4단계면 충분해요
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              복잡한 설정 없이, 가입 당일부터 예약을 받을 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="p-6 bg-slate-800/60 border border-slate-800 rounded-2xl"
              >
                <span className="text-2xl font-mono font-black text-violet-400">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 부가 장점 섹션 */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start">
            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              장부 정리 시간 단축
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              수기로 적던 예약 장부와 매출 정산을 자동으로 집계해
              마감 시간을 줄여줍니다.
            </p>
          </div>
          <div className="flex flex-col items-start">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              놓치는 예약 없이
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              예약 확정부터 노쇼까지 상태를 명확히 관리해 이중 예약과
              누락을 방지해요.
            </p>
          </div>
          <div className="flex flex-col items-start">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              어디서든 접속
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              PC와 모바일 어디서나 접속해 매장 현황을 실시간으로
              확인할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section className="bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="flex items-center justify-center space-x-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-800 max-w-2xl mx-auto leading-relaxed">
            &ldquo;예약 장부를 따로 안 써도 되니 마감이 훨씬 빨라졌어요.
            디자이너별 실적도 한눈에 보여서 좋습니다.&rdquo;
          </p>
          <p className="mt-4 text-sm text-slate-400 font-medium">
            — 염색온 파트너 매장 원장님
          </p>
        </div>
      </section>

      {/* 요금제 섹션 (간단 안내) */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 rounded-3xl p-12 shadow-xl shadow-violet-600/20">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            지금 바로 매장을 등록해보세요
          </h2>
          <p className="mt-3 text-violet-100 text-sm sm:text-base">
            가입과 매장 등록은 무료입니다. 파트너 계정을 만들고
            바로 예약 관리를 시작하세요.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center space-x-2 text-sm font-bold text-violet-700 bg-white hover:bg-violet-50 px-6 py-3.5 rounded-xl shadow-lg transition-all"
          >
            <span>무료로 시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-violet-600 rounded-lg text-white">
            </div>
            <span className="text-sm font-bold text-slate-700">염색온</span>
            <span className="text-xs text-slate-400">SaaS</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} 염색온. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
