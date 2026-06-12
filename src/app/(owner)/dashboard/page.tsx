"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  Scissors,
  DollarSign,
  Clock,
  ChevronRight,
  Award,
} from "lucide-react";

// 대쉬보드 데이터 타입 정의
interface DashboardData {
  summary: {
    totalRevenue: number;
    revenueGrowth: number;
    activeCustomers: number;
    customerGrowth: number;
    todayReservations: number;
    pendingReservations: number;
  };
  recentReservations: Array<{
    id: string;
    customerName: string;
    designerName: string;
    treatment: string;
    time: string;
    status: "CONFIRMED" | "PENDING" | "COMPLETED";
  }>;
  topDesigners: Array<{
    name: string;
    rank: number;
    reservations: number;
    revenue: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API 호출 및 데이터 세팅 (실제 환경에 맞게 URI 조절)
    fetch("/api/v1/shops/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // API 연결 전 시각적 확인을 위한 Mock Data (데이터가 없을 때 보여짐)
  const displayData = data || {
    summary: {
      totalRevenue: 5420000,
      revenueGrowth: 12.5,
      activeCustomers: 324,
      customerGrowth: 8.2,
      todayReservations: 14,
      pendingReservations: 3,
    },
    recentReservations: [
      {
        id: "1",
        customerName: "김서연",
        designerName: "엘리 수석디자이너",
        treatment: "프리미엄 전체 염색 + 클리닉",
        time: "14:00",
        status: "CONFIRMED",
      },
      {
        id: "2",
        customerName: "이준우",
        designerName: "레오 원장",
        treatment: "탈색 2회 + 애쉬그레이 토닝",
        time: "15:30",
        status: "PENDING",
      },
      {
        id: "3",
        customerName: "박민지",
        designerName: "민지 디자이너",
        treatment: "시크릿 투톤 염색",
        time: "17:00",
        status: "CONFIRMED",
      },
    ],
    topDesigners: [
      { name: "레오 원장", rank: 1, reservations: 112, revenue: "4,200,000원" },
      {
        name: "엘리 수석디자이너",
        rank: 2,
        reservations: 94,
        revenue: "3,150,000원",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans">
      {/* 상단 타이틀 세션 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            매장 현황 대쉬보드
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            오늘 우리 염색숍의 실적과 예약 현황을 한눈에 확인하세요.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-sm font-medium text-slate-700">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>실시간 업데이트 중</span>
        </div>
      </div>

      {/* 1. 핵심 요약 카드 리스트 (4열 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 카드 1: 매출 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +
              {displayData.summary.revenueGrowth}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">
              이번 달 총 매출
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {displayData.summary.totalRevenue.toLocaleString()}원
            </h3>
          </div>
        </div>

        {/* 카드 2: 활성 고객 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +
              {displayData.summary.customerGrowth}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">방문 고객 수</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {displayData.summary.activeCustomers}명
            </h3>
          </div>
        </div>

        {/* 카드 3: 오늘 예약 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">
              오늘 확정된 예약
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {displayData.summary.todayReservations}건
            </h3>
          </div>
        </div>

        {/* 카드 4: 대기 예약 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
              <Scissors className="w-6 h-6" />
            </div>
            {displayData.summary.pendingReservations > 0 && (
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full animate-pulse">
                확인 필요
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">승인 대기 예약</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 text-sky-600">
              {displayData.summary.pendingReservations}건
            </h3>
          </div>
        </div>
      </div>

      {/* 2. 하단 상세 정보 메인 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 최근 예약 리스트 현황 (2/3 너비차지) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                최근 예약 및 접수 현황
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                매장에 접수된 최신 예약 리스트입니다.
              </p>
            </div>
            <button className="text-sm text-indigo-600 font-semibold flex items-center hover:text-indigo-700 transition-colors">
              전체 보기 <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">고객명</th>
                  <th className="px-6 py-3">담당 디자이너</th>
                  <th className="px-6 py-3">시술 종류</th>
                  <th className="px-6 py-3">예약 시간</th>
                  <th className="px-6 py-3 text-right">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {displayData.recentReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {res.customerName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {res.designerName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {res.treatment}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {res.time}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          res.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700"
                            : res.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {res.status === "CONFIRMED"
                          ? "예약 확정"
                          : res.status === "PENDING"
                            ? "승인 대기"
                            : "시술 완료"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 이번 달 우수 디자이너 (1/3 너비차지) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <Award className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900">
                이달의 우수 디자이너
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {displayData.topDesigners.map((designer, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {designer.rank}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {designer.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        총 시술 {designer.reservations}건
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-700">
                      {designer.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center">
            <p className="text-xs text-indigo-700 font-medium">
              💡 예약을 유도하기 위해 마케팅 SMS 발송을 설정해 보세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
