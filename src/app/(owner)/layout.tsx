"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserSquare2,
  LogOut,
  Store,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("원장님"); // 기본값 세팅
  const [userInitial, setUserInitial] = useState("M");

  // 브라우저 쿠키에서 JWT 토큰을 읽어 유저 이름을 동적으로 가져오는 로직
  useEffect(() => {
    try {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
      };

      const token = getCookie("token");
      if (token) {
        // JWT 토큰의 Payload(두 번째 세그먼트)를 파싱하여 복호화 진행
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );

        const decoded = JSON.parse(jsonPayload);
        // 토큰 발급 시 저장된 payload 규격에 맞춰 이름(name) 추출
        if (decoded && decoded.name) {
          setUserName(decoded.name);
          setUserInitial(decoded.name.charAt(0).toUpperCase());
        } else if (decoded && decoded.email) {
          // 이름이 없을 경우 이메일 앞자리 활용
          const emailName = decoded.email.split("@")[0];
          setUserName(emailName);
          setUserInitial(emailName.charAt(0).toUpperCase());
        }
      }
    } catch (error) {
      console.error("토큰 프로필 가공 오류:", error);
    }
  }, [pathname]);

  // 페이지 이동 시 모바일 메뉴 자동으로 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 🔒 로그아웃 핸들러 기능 구현
  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      // 1. 브라우저의 인증 토큰 쿠키 만료 처리로 삭제
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;";

      // 2. 로그인 화면으로 강제 이동 및 세션 갱신
      router.push("/login");
      router.refresh();
    }
  };

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

  const currentMenuLabel =
    menuItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    )?.label || "대시보드";

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased font-sans overflow-hidden">
      {/* 📱 모바일 전용 사이드바 오버레이 배경 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 🏢 왼쪽 사이드바 */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shadow-xl z-50 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* 로고 영역 */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
            <button
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="p-4">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              매장 관리 메뉴
            </p>
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
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

        {/* 👤 하단 프로필 및 로그아웃 푸터 (동적 데이터 바인딩 완료) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 px-2 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-inner uppercase">
              {userInitial}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {userName} 원장님
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Premium Member
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-rose-400 hover:border-rose-950/30 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>안전하게 로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 🖥️ 오른쪽 본문 영역 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span className="hidden sm:inline">워크스페이스</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">
                {currentMenuLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-indigo-700 font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span className="hidden xs:inline">정식 버전을 이용 중입니다</span>
            <span className="xs:hidden">정식 버전</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/60 selection:bg-indigo-500/10">
          {children}
        </main>
      </div>
    </div>
  );
}
