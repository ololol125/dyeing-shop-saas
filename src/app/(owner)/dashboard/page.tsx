"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trophy,
  User,
  Scissors,
} from "lucide-react";

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

// 🎯 export default 가 정확하게 명시된 React 컴포넌트
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    try {
      const token = getCookie("token");

      // 영현님의 매장 대시보드 API 주소 호출
      const res = await fetch("/api/v1/shops/dashboard", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok)
        throw new Error("대시보드 실시간 데이터를 가져오지 못했습니다.");

      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      } else {
        throw new Error(resData.error || "통계 데이터 파싱 실패");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 mt-4 font-medium">
          매장 실시간 통계 집계 중...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            대시보드를 로드할 수 없습니다
          </h3>
          <p className="text-xs text-rose-400 mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center mx-auto space-x-1"
          >
            <RefreshCw className="w-3 h-3" /> <span>다시 시도</span>
          </button>
        </div>
      </div>
    );
  }

  const { summary, recentReservations, topDesigners } = data;

  return (
    <div className="p-6 md:p-10 font-sans antialiased text-slate-800 bg-slate-50/30 min-h-screen">
      {/* 상단 타이틀 레이아웃 바 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            헤어숍 경영 대시보드
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            데이터베이스 연동 기반 실시간 매장 운영 요약 리포트
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
          title="새로고침"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 📊 핵심 KPI 스코어 카드 구역 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 카드 1: 이번 달 총 매출 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              이번 달 총 매출액
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-2xl font-mono font-bold text-slate-900">
            {summary.totalRevenue.toLocaleString()}원
          </h2>
          <p className="text-xs text-emerald-600 mt-2 flex items-center font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> 전월 대비 +
            {summary.revenueGrowth}%
          </p>
        </div>

        {/* 카드 2: 이번 달 활성 고객 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              이번 달 방문 손님
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-2xl font-mono font-bold text-slate-900">
            {summary.activeCustomers}명
          </h2>
          <p className="text-xs text-indigo-600 mt-2 flex items-center font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> 전월 대비 +
            {summary.customerGrowth}%
          </p>
        </div>

        {/* 카드 3: 오늘 매장 예약 확정 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              오늘 시술/확정
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-2xl font-mono font-bold text-slate-900">
            {summary.todayReservations}건
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            오늘 방문 예정 및 마감 완료 수
          </p>
        </div>

        {/* 카드 4: 대기 예약 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              승인 대기 건수
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-2xl font-mono font-bold text-slate-900">
            {summary.pendingReservations}건
          </h2>
          <p className="text-xs text-rose-500 mt-2 font-medium">
            원장님 확인 대기중
          </p>
        </div>
      </div>

      {/* 📊 하단 복합 데이터 섹션 (최근 스케줄 & 디자이너 랭킹) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 최근 접수된 스케줄 현황 (2컬럼 분량) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              최근 접수 스케줄 (최신 5건)
            </h3>
            <span className="text-xs font-medium text-slate-400 font-mono">
              Real-time Feed
            </span>
          </div>

          {recentReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] text-center text-slate-400">
              <Calendar className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-medium">
                매장에 인서트된 예약 내역이 전혀 없습니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3">고객명</th>
                    <th className="pb-3">시술/시간</th>
                    <th className="pb-3">담당 디자이너</th>
                    <th className="pb-3 text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                  {recentReservations.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="py-3.5 font-bold text-slate-800 flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 text-slate-400" />{" "}
                        {res.customerName}
                      </td>
                      <td className="py-3.5">
                        <span className="text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mr-2">
                          {res.treatment}
                        </span>
                        <span className="font-mono text-slate-400">
                          {res.time}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 font-normal">
                        {res.designerName}
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            res.status === "COMPLETED"
                              ? "bg-slate-100 text-slate-600"
                              : res.status === "CONFIRMED"
                                ? "bg-indigo-50 text-indigo-700"
                                : res.status === "NOSHOW"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {res.status === "COMPLETED"
                            ? "시술 완료"
                            : res.status === "CONFIRMED"
                              ? "예약 확정"
                              : res.status === "NOSHOW"
                                ? "노쇼"
                                : "취소됨"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 이번 달 디자이너 실적 TOP 3 랭킹보드 (1컬럼 분량) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              이번 달 디자이너 매출 랭킹
            </h3>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>

          {topDesigners.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] text-center text-slate-400">
              <Scissors className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-medium">
                활동중인 디자이너 혹은 실적이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-start">
              {topDesigners.map((designer) => (
                <div
                  key={designer.rank}
                  className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                        designer.rank === 1
                          ? "bg-amber-100 text-amber-700 font-extrabold"
                          : designer.rank === 2
                            ? "bg-slate-200 text-slate-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {designer.rank}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {designer.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        시술 건수 {designer.reservations}건
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {designer.revenue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
