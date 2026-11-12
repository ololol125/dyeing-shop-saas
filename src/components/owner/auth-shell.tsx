import React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

// 사장님 로그인 / 회원가입 화면 공통 틀
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas px-4 py-10 text-ink antialiased">
      <div className="mx-auto w-full max-w-lg">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          <LogoMark size={48} />
          <span className="text-title font-bold text-ink">염색온</span>
          <span className="rounded-badge bg-brand-soft px-2 py-0.5 text-caption font-bold text-brand">사장님용</span>
        </Link>

        <div className="rounded-card border border-line bg-surface p-6 sm:p-10">
          <h1 className="text-display font-bold text-ink">{title}</h1>
          <p className="mt-2 text-body text-ink-sub">{description}</p>
          <div className="mt-8">{children}</div>
        </div>

        <div className="mt-6 text-center text-body text-ink">{footer}</div>
      </div>
    </div>
  );
}
