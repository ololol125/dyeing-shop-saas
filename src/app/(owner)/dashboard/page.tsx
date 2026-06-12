// src/app/(owner)/dashboard/page.tsx
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
  Loader2,
} from "lucide-react";

// ... 인터페이스 정의는 기존과 동일 ...

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // ⭕ Authorization 헤더에 JWT 토큰을 실어 API 호출
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const token = getCookie("token");

    fetch("/api/v1/shops/dashboard", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("대시보드 데이터를 가져오는 데 실패했습니다.");
        return res.json();
      })
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          throw new Error(resData.error || "데이터 조회를 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 1️⃣ 로딩 중일 때 예쁜 스피너 띄우기 (데이터 미준비로 인한 터짐 방지)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 mt-4 font-medium">
          대시보드 현황을 불러오는 중입니다...
        </p>
      </div>
    );
  }

  // 2️⃣ 에러가 발생했을 때 화면에 에러 가이드라인 노출
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <h3 className="text-base font-bold text-slate-800">
            데이터를 불러올 수 없습니다
          </h3>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
            {error || "인증 세션이 만료되었거나 매장 정보가 없습니다."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 성공적으로 준비되었을 때 안전하게 바인딩
  const summary = data.summary;
  const recentReservations = data.recentReservations || [];
  const topDesigners = data.topDesigners || [];

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

      {/* 1. 핵심 요약 카드 리스트 (옵셔널 체이닝 ?. 적용으로 안전성 극대화) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 카드 1: 매출 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +
              {summary?.revenueGrowth ?? 0}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">
              이번 달 총 매출
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {(summary?.totalRevenue ?? 0).toLocaleString()}원
            </h3>
          </div>
        </div>

        {/* 카드 2: 활성 고객 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +
              {summary?.customerGrowth ?? 0}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">방문 고객 수</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {summary?.activeCustomers ?? 0}명
            </h3>
          </div>
        </div>

        {/* 카드 3: 오늘 예약 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
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
              {summary?.todayReservations ?? 0}건
            </h3>
          </div>
        </div>

        {/* 카드 4: 대기 예약 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
              <Scissors className="w-6 h-6" />
            </div>
            {(summary?.pendingReservations ?? 0) > 0 && (
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full animate-pulse">
                확인 필요
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">승인 대기 예약</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1 text-sky-600">
              {summary?.pendingReservations ?? 0}건
            </h3>
          </div>
        </div>
      </div>

      {/* 2. 하단 상세 정보 섹션 (recentReservations, topDesigners 맵핑 구역 생략 - 기존과 동일) */}
      {/* ... */}
    </div>
  );
}
