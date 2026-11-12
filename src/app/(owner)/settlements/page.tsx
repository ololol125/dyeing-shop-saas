"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  Wallet,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Hourglass,
  AlertTriangle,
  Pencil,
  ReceiptText,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  PageContainer,
  PageHeader,
  SectionTitle,
} from "@/components/owner/ui";
import { authHeaders, errorMessage, formatKstDate, formatKstTime, formatWon, menuLabel } from "@/lib/client-utils";

interface MonthlySettlement {
  month: string;
  paymentCount: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: "IN_PROGRESS" | "SCHEDULED" | "PAID";
  paidAt: string | null;
}

interface SettlementLine {
  paymentId: string;
  paidAt: string;
  customerName: string;
  menuType: string;
  amount: number;
  commissionRateBps: number;
  commission: number;
  net: number;
}

interface SettlementSummary {
  commissionRateBps: number;
  commissionRateText: string;
  account: { bankName: string; accountNumberLast4: string; accountHolder: string } | null;
  months: MonthlySettlement[];
}

const monthLabel = (month: string) => {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
};

// 정산 상태 (색 + 아이콘 + 글자)
function SettlementStatusBadge({ status }: { status: MonthlySettlement["status"] }) {
  if (status === "PAID") {
    return (
      <Badge icon={CheckCircle2} className="border-success/30 bg-success-soft text-success">
        지급 완료
      </Badge>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <Badge icon={Hourglass} className="border-info/30 bg-info-soft text-info">
        이번 달 집계 중
      </Badge>
    );
  }
  return (
    <Badge icon={Clock} className="border-warning/30 bg-warning-soft text-warning">
      지급 예정
    </Badge>
  );
}

export default function SettlementsPage() {
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 펼쳐 본 달의 결제 건별 내역
  const [openMonth, setOpenMonth] = useState<string | null>(null);
  const [lines, setLines] = useState<Record<string, SettlementLine[]>>({});
  const [linesLoading, setLinesLoading] = useState(false);
  const [linesError, setLinesError] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/settlements", { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "정산 내역을 불러오지 못했습니다.");
      setSummary(data.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const toggleMonth = async (month: string) => {
    if (openMonth === month) {
      setOpenMonth(null);
      return;
    }
    setOpenMonth(month);
    setLinesError("");
    if (lines[month]) return;

    setLinesLoading(true);
    try {
      const res = await fetch(`/api/v1/settlements?month=${month}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "결제 내역을 불러오지 못했습니다.");
      setLines((prev) => ({ ...prev, [month]: data.data.lines }));
    } catch (err) {
      setLinesError(errorMessage(err));
    } finally {
      setLinesLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState text="정산 내역을 불러오는 중입니다" />
      </PageContainer>
    );
  }

  if (error || !summary) {
    return (
      <PageContainer narrow>
        <Card>
          <ErrorState message={error || "정산 내역을 불러오지 못했습니다."} onRetry={fetchSummary} />
        </Card>
      </PageContainer>
    );
  }

  const { account, months, commissionRateText } = summary;
  const pendingTotal = months.filter((m) => m.status !== "PAID").reduce((sum, m) => sum + m.netAmount, 0);

  return (
    <PageContainer>
      <PageHeader
        title="정산 (받을 돈)"
        description={`손님이 앱에서 결제한 금액에서 염색온 수수료(${commissionRateText})를 뺀 금액을 매달 한 번 정산해 드려요.`}
      />

      <div className="mb-6">
        <Notice tone="info">
          정산 지급은 준비 중이에요. 지금은 받으실 금액만 보여 드리고, 지급이 시작되면 따로 안내해 드릴게요.
        </Notice>
      </div>

      {/* 요약 + 계좌 */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 text-body font-semibold text-ink-sub">
            <Wallet className="h-5 w-5 text-brand" aria-hidden />
            아직 받지 않은 금액
          </div>
          <p className="mt-3 text-display font-bold tabular-nums text-ink">{formatWon(pendingTotal)}</p>
          <p className="mt-1 text-caption text-ink-sub">이번 달 집계 중 + 지급 예정 금액의 합계</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-body font-semibold text-ink-sub">
            <Landmark className="h-5 w-5 text-brand" aria-hidden />
            정산 받을 계좌
          </div>
          {account ? (
            <>
              <p className="mt-3 text-heading font-bold text-ink">
                {account.bankName} ****{account.accountNumberLast4}
              </p>
              <p className="text-body text-ink-sub">예금주 {account.accountHolder}</p>
              <Link
                href="/settlements/account"
                className="mt-4 inline-flex min-h-touch items-center gap-2 rounded-control border-2 border-brand px-5 text-button font-bold text-brand hover:bg-brand-soft"
              >
                <Pencil className="h-5 w-5" aria-hidden />
                계좌 바꾸기
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 flex items-center gap-2 text-body font-bold text-warning">
                <AlertTriangle className="h-5 w-5" aria-hidden />
                아직 계좌를 등록하지 않으셨어요
              </p>
              <Link
                href="/settlements/account"
                className="mt-4 inline-flex min-h-touch items-center gap-2 rounded-control bg-brand px-5 text-button font-bold text-white hover:bg-brand-pressed"
              >
                <Landmark className="h-5 w-5" aria-hidden />
                정산 계좌 등록하기
              </Link>
            </>
          )}
        </Card>
      </div>

      {/* 월별 정산 */}
      <SectionTitle>월별 정산</SectionTitle>
      {months.every((m) => m.paymentCount === 0) ? (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="아직 앱으로 결제된 예약이 없어요"
            description="손님이 염색온 앱에서 예약하고 결제하면 여기에 정산 금액이 쌓여요."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {months.map((m) => {
            const open = openMonth === m.month;
            return (
              <Card key={m.month} padded={false}>
                <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-heading font-bold text-ink">{monthLabel(m.month)}</h3>
                      <SettlementStatusBadge status={m.status} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-body sm:grid-cols-4">
                      <div>
                        <dt className="text-ink-sub">결제 건수</dt>
                        <dd className="font-bold tabular-nums text-ink">{m.paymentCount}건</dd>
                      </div>
                      <div>
                        <dt className="text-ink-sub">결제 합계</dt>
                        <dd className="font-bold tabular-nums text-ink">{formatWon(m.grossAmount)}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-sub">수수료</dt>
                        <dd className="font-bold tabular-nums text-ink">− {formatWon(m.commissionAmount)}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-sub">받을 금액</dt>
                        <dd className="text-heading font-bold tabular-nums text-brand">{formatWon(m.netAmount)}</dd>
                      </div>
                    </dl>
                    {m.status === "PAID" && m.paidAt && (
                      <p className="mt-2 text-caption text-ink-sub">{formatKstDate(m.paidAt)}에 지급했어요.</p>
                    )}
                  </div>
                  {m.paymentCount > 0 && (
                    <Button
                      variant="secondary"
                      icon={open ? ChevronUp : ChevronDown}
                      onClick={() => toggleMonth(m.month)}
                      aria-expanded={open}
                    >
                      {open ? "결제 내역 접기" : "결제 내역 보기"}
                    </Button>
                  )}
                </div>

                {open && (
                  <div className="border-t border-line bg-canvas p-5 md:p-6">
                    {linesLoading && !lines[m.month] ? (
                      <LoadingState text="결제 내역을 불러오는 중입니다" />
                    ) : linesError ? (
                      <ErrorState message={linesError} onRetry={() => { setOpenMonth(null); toggleMonth(m.month); }} />
                    ) : (
                      <ul className="divide-y divide-line">
                        {(lines[m.month] ?? []).map((line) => (
                          <li key={line.paymentId} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3 text-body">
                            <span className="w-40 shrink-0 text-ink-sub">
                              {formatKstDate(line.paidAt)} {formatKstTime(line.paidAt)}
                            </span>
                            <span className="min-w-0 flex-1 font-semibold text-ink">
                              {line.customerName} 손님 · {menuLabel(line.menuType)}
                            </span>
                            <span className="tabular-nums text-ink">{formatWon(line.amount)}</span>
                            <span className="tabular-nums text-ink-sub">수수료 − {formatWon(line.commission)}</span>
                            <span className="font-bold tabular-nums text-brand">{formatWon(line.net)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-caption text-ink-sub">
        정산은 결제일(한국 시간) 기준 한 달 단위로 묶어요. 수수료율이 바뀌어도 이미 결제된 예약에는 결제할 때의 수수료율이 적용돼요.
      </p>
    </PageContainer>
  );
}
