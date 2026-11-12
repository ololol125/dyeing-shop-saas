"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserSquare2,
  LogOut,
  Menu,
  X,
  Newspaper,
  Store,
  Wallet,
} from "lucide-react";
import { getCookie } from "@/lib/client-utils";
import { Logo } from "@/components/brand/logo";

const menuItems = [
  { href: "/dashboard", label: "오늘 한눈에 보기", icon: LayoutDashboard },
  { href: "/reservations", label: "예약 관리", icon: CalendarDays },
  { href: "/designers", label: "선생님(디자이너) 관리", icon: UserSquare2 },
  { href: "/shop", label: "매장 정보", icon: Store },
  { href: "/posts", label: "매장 소식 올리기", icon: Newspaper },
  { href: "/settlements", label: "정산 (받을 돈)", icon: Wallet },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("원장님"); // 기본값 세팅

  // 브라우저 쿠키의 JWT 토큰에서 이름(없으면 이메일 앞자리)을 읽어 표시
  useEffect(() => {
    try {
      const token = getCookie("token");
      if (!token) return;
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const decoded = JSON.parse(jsonPayload);
      if (decoded?.name) setUserName(decoded.name);
      else if (decoded?.email) setUserName(decoded.email.split("@")[0]);
    } catch (error) {
      console.error("토큰 프로필 가공 오류:", error);
    }
  }, [pathname]);

  // 페이지 이동 시 모바일 메뉴 자동으로 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠어요?")) {
      // 인증 토큰 쿠키 만료 처리 후 로그인 화면으로
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;";
      router.push("/login");
      router.refresh();
    }
  };

  const isActive = (href: string) => pathname.startsWith(href);
  const currentMenuLabel =
    menuItems.find((item) => isActive(item.href))?.label ?? "염색온 매장 관리";

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink antialiased">
      {/* 모바일: 메뉴가 열렸을 때 뒤 배경 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 왼쪽 메뉴 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-line bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* 로고 */}
          <div className="flex items-center justify-between border-b border-line px-5 py-5">
            <Link href="/dashboard" aria-label="오늘 한눈에 보기로 이동">
              <Logo size={44} subtitle="사장님 매장 관리" />
            </Link>
            <button
              className="inline-flex min-h-touch cursor-pointer items-center gap-1 rounded-control px-3 text-body font-semibold text-ink-sub hover:bg-canvas lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden />
              닫기
            </button>
          </div>

          {/* 메뉴 */}
          <nav className="space-y-1.5 p-4" aria-label="매장 관리 메뉴">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-touch items-center gap-3 rounded-control px-4 text-body font-semibold transition-colors ${
                    active
                      ? "bg-brand text-white"
                      : "text-ink hover:bg-brand-soft"
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 프로필 + 로그아웃 */}
        <div className="border-t border-line p-4">
          <p className="mb-3 px-1 text-body font-semibold text-ink">
            {userName} <span className="font-normal text-ink-sub">원장님</span>
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex min-h-touch w-full cursor-pointer items-center justify-center gap-2 rounded-control border-[1.5px] border-line-strong text-body font-semibold text-ink hover:bg-canvas"
          >
            <LogOut className="h-5 w-5" aria-hidden />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 오른쪽 본문 */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 lg:px-8">
          <button
            className="inline-flex min-h-touch cursor-pointer items-center gap-2 rounded-control px-3 text-body font-semibold text-ink hover:bg-canvas lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden />
            메뉴
          </button>
          <p className="text-heading font-bold text-ink">{currentMenuLabel}</p>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
