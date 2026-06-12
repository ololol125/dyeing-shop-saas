"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  DollarSign,
  Loader2,
  AlertCircle,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
} from "lucide-react";

interface Reservation {
  reservationId: number;
  customerName: string;
  customerPhone: string;
  treatment: "ROOT_DYE" | "FULL_DYE" | string;
  totalAmount: number;
  reservationTime: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NOSHOW"; // ⭕ DDL 제약조건 반영
  designerName: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };

  // 🔄 1. 이번 달 예약 목록 로드 (GET)
  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/reservations", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("예약 현황 목록을 불러오지 못했습니다.");
      const resData = await res.json();

      if (resData.success) {
        setReservations(resData.data || []);
      } else {
        throw new Error(resData.error || "조회 실패");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // 🔄 2. 예약 상태 변경 제어 핸들러 (PATCH)
  const handleUpdateStatus = async (
    reservationId: number,
    nextStatus: "COMPLETED" | "CANCELLED" | "NOSHOW",
  ) => {
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/reservations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reservationId, status: nextStatus }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success)
        throw new Error(resData.error || "상태 변경 실패");

      // 새로고침 연동
      fetchReservations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 클라이언트 사이드 필터링
  const filteredReservations = reservations.filter((res) => {
    if (statusFilter === "ALL") return true;
    return res.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-10 font-sans antialiased text-slate-800">
      {/* 타이틀 및 필터 세션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            예약 현황 관리
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            우리 매장에 접수된 시술 예약 내역을 실시간으로 확인하고 제어합니다.
          </p>
        </div>

        {/* 변경된 DDL 기준 맞춤 상태 필터 */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
          >
            <option value="ALL">전체 상태 보기</option>
            <option value="CONFIRMED">✅ 예약 확정</option>
            <option value="COMPLETED">✨ 시술 완료</option>
            <option value="CANCELLED">❌ 예약 취소</option>
            <option value="NOSHOW">⚠️ 노쇼 (No-Show)</option>
          </select>
        </div>
      </div>

      {/* 메인 데이터 보드 */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-400 mt-3 font-medium">
            실시간 스케줄 매핑 중...
          </p>
        </div>
      ) : error ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm text-center">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            예약 일정을 가져오지 못했습니다
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px]">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            조건에 맞는 예약이 없습니다
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            조회된 시술 접수 현황이 확인되지 않습니다.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">고객 정보</th>
                  <th className="px-6 py-4">예약 시간</th>
                  <th className="px-6 py-4">시술 메뉴 / 담당자</th>
                  <th className="px-6 py-4">시술 금액</th>
                  <th className="px-6 py-4">현재 상태</th>
                  <th className="px-6 py-4 text-center">매장 실시간 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredReservations.map((res) => {
                  const resDate = new Date(res.reservationTime);
                  return (
                    <tr
                      key={res.reservationId}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* 1. 고객명 및 번호 */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 flex items-center">
                            <User className="w-3.5 h-3.5 mr-1 text-slate-400" />{" "}
                            {res.customerName}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5 flex items-center font-mono">
                            <Phone className="w-3 h-3 mr-1 text-slate-300" />{" "}
                            {res.customerPhone}
                          </span>
                        </div>
                      </td>

                      {/* 2. 날짜 및 시간 */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col font-mono text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">
                            {resDate.toLocaleDateString("ko-KR", {
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </span>
                          <span className="text-slate-400 mt-0.5 flex items-center text-[11px]">
                            <Clock className="w-3 h-3 mr-0.5 text-indigo-400" />{" "}
                            {resDate.toTimeString().substring(0, 5)}
                          </span>
                        </div>
                      </td>

                      {/* 3. 시술 메뉴 및 담당 디자이너 */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md w-fit">
                            {res.treatment === "FULL_DYE"
                              ? "전체 염색"
                              : res.treatment === "ROOT_DYE"
                                ? "뿌리 염색"
                                : res.treatment}
                          </span>
                          <span className="text-xs text-slate-500 font-medium mt-1 flex items-center">
                            <Scissors className="w-3 h-3 mr-1 text-slate-400" />{" "}
                            {res.designerName}
                          </span>
                        </div>
                      </td>

                      {/* 4. 시술 금액 */}
                      <td className="px-6 py-4 font-bold text-slate-800 font-mono">
                        {res.totalAmount.toLocaleString()}원
                      </td>

                      {/* 5. ⭕ DDL 기준에 부합하는 상태 변경 배지 디자인 */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            res.status === "CONFIRMED"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : res.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : res.status === "NOSHOW"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {res.status === "CONFIRMED" ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              예약 확정
                            </>
                          ) : res.status === "COMPLETED" ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              시술 완료
                            </>
                          ) : res.status === "NOSHOW" ? (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              노쇼 처리
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              취소됨
                            </>
                          )}
                        </span>
                      </td>

                      {/* 6. ⭕ 제약조건에 최적화된 상태 변경 액션 제어반 */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {res.status === "CONFIRMED" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    res.reservationId,
                                    "COMPLETED",
                                  )
                                }
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                시술 완료
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    res.reservationId,
                                    "NOSHOW",
                                  )
                                }
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                노쇼 등록
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    res.reservationId,
                                    "CANCELLED",
                                  )
                                }
                                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-slate-500 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                취소
                              </button>
                            </>
                          )}
                          {(res.status === "CANCELLED" ||
                            res.status === "COMPLETED" ||
                            res.status === "NOSHOW") && (
                            <span className="text-xs text-slate-300 font-medium font-mono select-none">
                              - 마감 -
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
