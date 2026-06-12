"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Calendar,
  Clock,
  Scissors,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  UserPlus,
} from "lucide-react";

interface DesignerBadge {
  designerId: number;
  designerName: string;
  position: string;
}

interface Reservation {
  reservationId: number;
  clientId: number;
  customerName: string;
  customerPhone: string;
  treatment: string;
  totalAmount: number;
  reservationTime: string;
  status: string;
  designerName: string;
  designers: DesignerBadge[];
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [shopDesigners, setShopDesigners] = useState<DesignerBadge[]>([]); // 🎯 매장 전체 디자이너 풀
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 시술 완료 모달 상태
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [treatmentNote, setTreatmentNote] = useState("");
  const [submittingHistory, setSubmittingHistory] = useState(false);

  // 🎯 디자이너 변경 모달 상태
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
  const [targetResId, setTargetResId] = useState<number | null>(null);
  const [selectedDesignerIds, setSelectedDesignerIds] = useState<number[]>([]);
  const [updatingDesigner, setUpdatingDesigner] = useState(false);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };

  // 데이터 로드 엔진 (예약 목록 + 매장 디자이너 풀 동시 로드)
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getCookie("token");
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. 예약 목록 fetch
      const resRes = await fetch("/api/v1/reservations", { headers });
      const resData = await resRes.json();

      // 2. 디자이너 목록 fetch
      const desRes = await fetch("/api/v1/designers", { headers });
      const desData = await desRes.json();

      if (resData.success && desData.success) {
        setReservations(resData.data || []);
        setShopDesigners(desData.data || []);
      } else {
        throw new Error("데이터를 연동하는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🎯 담당 디자이너 변경 처리 제출 (PATCH 호출 구역!)
  const handleDesignerUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResId) return;

    setUpdatingDesigner(true);
    try {
      const token = getCookie("token");

      // 🚀 백엔드 고도화용 PATCH API 정밀 타격
      const res = await fetch("/api/v1/reservations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reservationId: targetResId,
          designerIds: selectedDesignerIds, // 체크된 디자이너 ID 배열 전송
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success)
        throw new Error(resData.error || "변경 실패");

      setIsDesignerModalOpen(false);
      setTargetResId(null);
      fetchData(); // 🔄 목록 새로고침으로 실시간 배지 동기화
      alert("담당 디자이너 배정이 성공적으로 변경되었습니다!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingDesigner(false);
    }
  };

  // 디자이너 모달 오픈 핸들러
  const openDesignerModal = (
    resId: number,
    currentDesigners: DesignerBadge[],
  ) => {
    setTargetResId(resId);
    // 현재 배정되어 있는 디자이너 ID들로 체크박스 초기값 매핑
    setSelectedDesignerIds(currentDesigners.map((d) => d.designerId));
    setIsDesignerModalOpen(true);
  };

  // 시술 완료 모달 열기
  const openHistoryModal = (reservationId: number, clientId: number) => {
    setSelectedResId(Number(reservationId));
    setSelectedClientId(Number(clientId));
    setTreatmentNote("");
    setIsHistoryModalOpen(true);
  };

  // 시술 완료 제출 (POST)
  const handleCompleteHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId || !selectedClientId) return;

    setSubmittingHistory(true);
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/histories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reservationId: selectedResId,
          clientId: selectedClientId,
          treatmentNote: treatmentNote,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.error || "실패");

      setIsHistoryModalOpen(false);
      fetchData();
      alert("시술 마감 및 차트 기록 완료!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingHistory(false);
    }
  };

  // 체크박스 토글 핸들러
  const handleDesignerCheckboxChange = (id: number) => {
    setSelectedDesignerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 mt-4 font-medium">
          예약 데이터 정렬 중...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 font-sans antialiased text-slate-800 bg-slate-50/30 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          예약 현황 관리
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          매장 담당 디자이너 배지를 클릭하여 실시간으로 담당자를 변경할 수
          있습니다.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">고객 정보</th>
                <th className="px-6 py-4">예약 시간</th>
                <th className="px-6 py-4">시술 메뉴 / 담당자 (클릭 시 변경)</th>
                <th className="px-6 py-4">시술 금액</th>
                <th className="px-6 py-4">현재 상태</th>
                <th className="px-6 py-4 text-center">매장 실시간 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              {reservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => {
                  const date = new Date(res.reservationTime);
                  return (
                    <tr
                      key={res.reservationId}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/clients/${res.clientId}`}
                          className="font-bold text-slate-800 hover:text-indigo-600 cursor-pointer"
                        >
                          {res.customerName}
                        </Link>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {res.customerPhone}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono">
                        <div>
                          {date.toLocaleDateString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {res.reservationTime.substring(11, 16)}
                        </div>
                      </td>

                      {/* 3. 담당자 섹션: 클릭 가능한 컴포넌트 버튼 레이어로 격상 */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start space-y-1.5">
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {res.treatment === "FULL_DYE"
                              ? "전체 염색"
                              : res.treatment === "ROOT_DYE"
                                ? "뿌리 염색"
                                : res.treatment}
                          </span>

                          {/* ⭕ 클릭 시 재배정 모달 트리거 바인딩 */}
                          <button
                            onClick={() =>
                              openDesignerModal(
                                res.reservationId,
                                res.designers,
                              )
                            }
                            className="flex flex-wrap gap-1 hover:ring-2 hover:ring-indigo-600/20 p-1 rounded-lg transition-all text-left bg-transparent cursor-pointer group"
                            title="담당 디자이너 재배정"
                          >
                            {res.designers && res.designers.length > 0 ? (
                              res.designers.map((designer) => (
                                <span
                                  key={designer.designerId}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-100 group-hover:bg-indigo-950 transition-colors"
                                >
                                  <Scissors className="w-2.5 h-2.5 mr-1 text-slate-400 transform -rotate-45" />
                                  {designer.designerName}
                                  <span className="text-slate-400 font-normal text-[9px] ml-1">
                                    {designer.position}
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="inline-flex items-center text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 border-dashed">
                                <UserPlus className="w-2.5 h-2.5 mr-1" /> 담당자
                                미지정 (추가)
                              </span>
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {res.totalAmount.toLocaleString()}원
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            res.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700"
                              : res.status === "CONFIRMED"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {res.status === "COMPLETED" ? (
                          <span className="text-slate-300 font-bold">
                            - 마감 -
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              openHistoryModal(res.reservationId, res.clientId)
                            }
                            className="px-3 py-1.5 border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 rounded-xl font-bold cursor-pointer"
                          >
                            시술 완료
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🎯 8. 담당 디자이너 실시간 변경 변경 (PATCH) 트리거 팝업 모달 */}
      {isDesignerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Scissors className="w-4 h-4 mr-1.5 text-indigo-600" /> 담당
                디자이너 변경 배정
              </h3>
              <button
                onClick={() => setIsDesignerModalOpen(false)}
                className="text-slate-400 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDesignerUpdateSubmit}>
              <div className="p-5 space-y-3 max-h-[250px] overflow-y-auto">
                <p className="text-[11px] text-slate-400 mb-2">
                  이 예약 건에 투입될 디자이너를 선택하세요. (중복 선택 가능)
                </p>
                {shopDesigners.map((designer) => (
                  <label
                    key={designer.designerId}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">
                        {designer.designerName}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1 py-0.5 rounded">
                        {designer.position}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedDesignerIds.includes(
                        designer.designerId,
                      )}
                      onChange={() =>
                        handleDesignerCheckboxChange(designer.designerId)
                      }
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDesignerModalOpen(false)}
                  className="text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updatingDesigner}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer flex items-center space-x-1"
                >
                  {updatingDesigner ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>배정 관계 업데이트</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 시술 기록 모달 */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                시술완료 차트 기록
              </h3>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCompleteHistorySubmit}>
              <div className="p-6">
                <textarea
                  required
                  value={treatmentNote}
                  onChange={(e) => setTreatmentNote(e.target.value)}
                  placeholder="시술 메모를 입력하세요."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-normal resize-none"
                />
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="text-xs text-slate-500 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submittingHistory}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {submittingHistory ? "기록중..." : "완료 및 이력 저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
