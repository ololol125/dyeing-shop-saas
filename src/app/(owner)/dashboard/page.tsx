"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  CalendarCheck,
  Clock,
  RefreshCw,
  Trophy,
  Scissors,
  Store,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  ReservationStatusBadge,
  SectionTitle,
  StatCard,
} from "@/components/owner/ui";
import { authHeaders, errorMessage, formatWon } from "@/lib/client-utils";

// 백엔드 응답 규격 인터페이스 매칭
interface DashboardData {
  summary: {
    totalRevenue: number;
    revenueGrowth: number;
    activeCustomers: number;
    customerGrowth: number;
    todayReservations: number;
    pendingReservations: number;
  };
  recentReservations: {
    id: string;
    customerName: string;
    designerName: string;
    treatment: string;
    time: string;
    status: string;
  }[];
  topDesigners: {
    name: string;
    rank: number;
    reservations: number;
    revenue: string;
  }[];
}

const growthText = (value: number) => `지난달보다 ${value >= 0 ? "+" : ""}${value}%`;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noShop, setNoShop] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    setNoShop(false);

    try {
      const res = await fetch("/api/v1/shops/dashboard", { headers: authHeaders() });
      const resData = await res.json();

      if (res.status === 404) {
        // 아직 매장을 등록하지 않은 신규 오너 계정
        setNoShop(true);
        return;
      }

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "매장 현황을 가져오지 못했습니다.");
      }

      setData(resData);
    } catch (err) {
      console.error(err);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState text="매장 현황을 불러오는 중입니다" />
      </PageContainer>
    );
  }

  if (noShop) {
    return (
      <PageContainer narrow>
        <Card>
          <EmptyState
            icon={Store}
            title="먼저 매장을 등록해 주세요"
            description="매장 정보를 등록하시면 예약과 선생님을 관리할 수 있어요."
            action={
              <Link
                href="/shop/register"
                className="inline-flex min-h-touch items-center gap-2 rounded-control bg-brand px-6 text-button font-bold text-white hover:bg-brand-pressed"
              >
                매장 등록하러 가기
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer narrow>
        <Card>
          <ErrorState message={error || "매장 현황을 가져오지 못했습니다."} onRetry={fetchDashboardData} />
        </Card>
      </PageContainer>
    );
  }

  const { summary, recentReservations, topDesigners } = data;

  return (
    <PageContainer>
      <PageHeader
        title="오늘 한눈에 보기"
        description="이번 달 매출과 오늘 예약을 확인하세요."
        action={
          <Button variant="secondary" icon={RefreshCw} onClick={fetchDashboardData}>
            새로고침
          </Button>
        }
      />

      {/* 핵심 지표 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="오늘 예약"
          value={`${summary.todayReservations}건`}
          icon={CalendarCheck}
          note="오늘 방문 예정·완료"
        />
        <StatCard
          label="확인 기다리는 예약"
          value={`${summary.pendingReservations}건`}
          icon={Clock}
          note="원장님 확인이 필요해요"
        />
        <StatCard
          label="이번 달 매출"
          value={formatWon(summary.totalRevenue)}
          icon={Wallet}
          note={growthText(summary.revenueGrowth)}
        />
        <StatCard
          label="이번 달 손님"
          value={`${summary.activeCustomers}명`}
          icon={Users}
          note={growthText(summary.customerGrowth)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 최근 들어온 예약 */}
        <Card className="lg:col-span-2">
          <SectionTitle
            action={
              <Link
                href="/reservations"
                className="inline-flex min-h-touch items-center gap-1 rounded-control px-3 text-body font-bold text-brand hover:bg-brand-soft"
              >
                전체 보기
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            }
          >
            최근 들어온 예약
          </SectionTitle>

          {recentReservations.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="아직 들어온 예약이 없어요"
              description="손님이 염색온 앱으로 예약하면 여기에 바로 보여요."
            />
          ) : (
            <ul className="divide-y divide-line">
              {recentReservations.map((res) => (
                <li key={res.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                  <span className="w-24 text-heading font-bold tabular-nums text-ink">{res.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-bold text-ink">{res.customerName} 손님</p>
                    <p className="text-body text-ink-sub">
                      {res.treatment} · {res.designerName}
                    </p>
                  </div>
                  <ReservationStatusBadge status={res.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 이번 달 선생님별 매출 */}
        <Card>
          <SectionTitle>
            <span className="inline-flex items-center gap-2">
              <Trophy className="h-6 w-6 text-warning" aria-hidden />
              이번 달 선생님 순위
            </span>
          </SectionTitle>

          {topDesigners.length === 0 ? (
            <EmptyState icon={Scissors} title="아직 실적이 없어요" />
          ) : (
            <ol className="space-y-3">
              {topDesigners.map((designer) => (
                <li
                  key={designer.rank}
                  className="flex items-center gap-3 rounded-control border border-line bg-canvas p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-button font-bold text-white">
                    {designer.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-bold text-ink">{designer.name}</p>
                    <p className="text-caption text-ink-sub">시술 {designer.reservations}건</p>
                  </div>
                  <span className="text-body font-bold tabular-nums text-ink">{designer.revenue}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
