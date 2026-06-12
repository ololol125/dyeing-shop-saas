"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserSquare2,
  LogOut,
  Store,
  Sparkles,
} from "lucide-react";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 메뉴 아이템 구조화 및 액티브 상태 처리를 위한 배열
  const menuItems = [
    {
      href: "/dashboard",
      label: "대시보드 홈",
      icon: LayoutDashboard,
    },
    {
      href: "/reservations",
      label: "예약 현황 관리",
      icon: CalendarDays,
    },
    {
      href: "/designers",
      label: "디자이너 설정",
      icon: UserSquare2,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* 🏢 왼쪽 고정 사이드바 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shadow-xl z-10">
        <div>
          {/* 로고 영역: 트렌디한 그라데이션 포인트 */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold tracking-tight text-white">
                  DyeingShop
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                헤어숍 파트너 오너십
              </p>
            </div>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="p-4">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              매장 관리 메뉴
            </p>
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-indigo-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 하단 프로필 및 로그아웃 푸터 */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 px-2 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              M
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">
                마중 원장님
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Premium Member
              </p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-rose-400 hover:border-rose-950/30 transition-all duration-200">
            <LogOut className="w-3.5 h-3.5" />
            <span>안전하게 로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 🖥️ 오른쪽 본문 스크롤 영역 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 상단 미니 헤더바 (옵션: 검색이나 추가 알림 레이아웃용) */}
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <span>워크스페이스</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">
              {menuItems.find((item) => pathname === item.href)?.label ||
                "대시보드"}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-indigo-700 font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>정식 버전을 이용 중입니다</span>
          </div>
        </header>

        {/* 실제 페이지 콘텐츠 렌더링 구역 */}
        <main className="flex-1 overflow-y-auto bg-slate-50/60 selection:bg-indigo-500/10">
          {children}
        </main>
      </div>
    </div>
  );
}
