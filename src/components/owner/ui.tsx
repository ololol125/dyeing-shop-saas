"use client";

// 사장님 웹 공통 UI (디자인 토큰: src/app/globals.css의 @theme)
// - 본문 18px 이상, 연한 회색 글씨 금지(ink-sub 이상)
// - 버튼·입력창 높이 56px(h-touch), 아이콘은 항상 글자와 함께
// - 상태는 색 + 아이콘 + 글자로 표시

import React, { useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleSlash,
  Loader2,
  RefreshCw,
  UserX,
  X,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── 레이아웃 ───────────────────────────────────────────

export function PageContainer({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className={cx("mx-auto w-full px-4 py-6 md:px-8 md:py-10", narrow ? "max-w-3xl" : "max-w-6xl")}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-display font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-body text-ink-sub">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cx("rounded-card border border-line bg-surface", padded && "p-5 md:p-6", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-heading font-bold text-ink">{children}</h2>
      {action}
    </div>
  );
}

// ── 버튼 ───────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-pressed",
  secondary: "border-2 border-brand bg-surface text-brand hover:bg-brand-soft",
  danger: "border-2 border-error bg-surface text-error hover:bg-error-soft",
  ghost: "text-brand hover:bg-brand-soft",
};

export function Button({
  variant = "primary",
  icon: Icon,
  loading,
  loadingText = "처리하고 있어요",
  full,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  loadingText?: string;
  full?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex min-h-touch cursor-pointer items-center justify-center gap-2 rounded-control px-5 text-button font-bold transition-colors",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-wait",
        buttonStyles[variant],
        full && "w-full",
        className,
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

// ── 입력 ───────────────────────────────────────────────

export const inputClass =
  "block w-full min-h-touch rounded-control border-[1.5px] border-line-strong bg-surface px-4 py-3 text-body text-ink " +
  "placeholder:text-ink-sub/80 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/20 " +
  "read-only:bg-canvas read-only:text-ink-sub";

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-body font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-caption text-ink-sub">{hint}</p>}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: { box: "border-error/30 bg-error-soft text-error", Icon: AlertCircle },
    success: { box: "border-success/30 bg-success-soft text-success", Icon: CheckCircle2 },
    info: { box: "border-info/30 bg-info-soft text-info", Icon: AlertCircle },
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex items-start gap-2 rounded-control border p-4 text-body font-semibold", styles.box)}>
      <styles.Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

// ── 상태 배지 (색 + 아이콘 + 글자) ─────────────────────

const reservationStatus: Record<string, { label: string; Icon: LucideIcon; className: string }> = {
  CONFIRMED: { label: "예약 확정", Icon: CalendarCheck, className: "bg-success-soft text-success border-success/30" },
  COMPLETED: { label: "시술 완료", Icon: CheckCircle2, className: "bg-info-soft text-info border-info/30" },
  CANCELLED: { label: "예약 취소", Icon: CircleSlash, className: "bg-canvas text-ink-sub border-line-strong/40" },
  NOSHOW: { label: "방문 안 함", Icon: UserX, className: "bg-error-soft text-error border-error/30" },
};

export function Badge({
  icon: Icon,
  className,
  children,
}: {
  icon?: LucideIcon;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-badge border px-3 py-1 text-caption font-bold", className)}>
      {Icon && <Icon className="h-4 w-4" aria-hidden />}
      {children}
    </span>
  );
}

export function ReservationStatusBadge({ status }: { status: string }) {
  const s = reservationStatus[status] ?? { label: status, Icon: AlertCircle, className: "bg-canvas text-ink-sub border-line-strong/40" };
  return (
    <Badge icon={s.Icon} className={s.className}>
      {s.label}
    </Badge>
  );
}

// ── 화면 상태 (로딩 / 오류 / 비어 있음) ────────────────

export function LoadingState({ text = "불러오는 중입니다" }: { text?: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4" role="status">
      <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden />
      <p className="text-body text-ink-sub">{text}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="h-8 w-8" aria-hidden />
      </div>
      <h3 className="text-heading font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-body text-ink-sub">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = "다시 불러오기",
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="정보를 불러오지 못했어요"
      description={message}
      action={
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          {retryLabel}
        </Button>
      }
    />
  );
}

// ── 팝업 (모달) ────────────────────────────────────────

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  // Esc 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-card bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <h2 className="text-heading font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-touch cursor-pointer items-center gap-1 rounded-control px-3 text-body font-semibold text-ink-sub hover:bg-canvas"
          >
            <X className="h-5 w-5" aria-hidden />
            닫기
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line bg-canvas px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

// ── 핵심 지표 카드 ─────────────────────────────────────

export function StatCard({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  note?: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-body font-semibold text-ink-sub">
        <Icon className="h-5 w-5 text-brand" aria-hidden />
        {label}
      </div>
      <p className="mt-3 text-display font-bold tabular-nums text-ink">{value}</p>
      {note && <p className="mt-1 text-caption text-ink-sub">{note}</p>}
    </Card>
  );
}
