import React from "react";

// 염색온 로고: 밤색 바탕 위 흰 염색약 방울 하나 (아래쪽은 따뜻하게 물든 색)
// 색은 디자인 토큰(--color-brand / --color-brand-soft)과 같은 값
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="염색온"
      className={className}
    >
      <rect width="48" height="48" rx="12" fill="#6E3B2A" />
      <path d="M24 9.5C24 9.5 13 22.2 13 29.4C13 35.5 17.9 40 24 40C30.1 40 35 35.5 35 29.4C35 22.2 24 9.5 24 9.5Z" fill="#FFFFFF" />
      <path d="M13.2 30.5C13.7 35.9 18.3 40 24 40C29.7 40 34.3 35.9 34.8 30.5C31.5 32.2 27.9 33 24 33C20.1 33 16.5 32.2 13.2 30.5Z" fill="#F3E9E2" />
    </svg>
  );
}

// 로고 + 글자
export function Logo({ size = 40, subtitle }: { size?: number; subtitle?: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark size={size} />
      <span className="flex flex-col leading-tight">
        <span className="text-heading font-bold text-ink">염색온</span>
        {subtitle && <span className="text-caption text-ink-sub">{subtitle}</span>}
      </span>
    </span>
  );
}
