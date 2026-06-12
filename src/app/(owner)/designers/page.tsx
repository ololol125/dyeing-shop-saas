"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Loader2,
  X,
  Check,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";

interface Designer {
  designerId: number;
  designerName: string;
  position: string;
  isActive: boolean;
  createdAt: string;
}

export default function DesignersPage() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 모달 및 등록 폼 관련 상태값
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDesignerName, setNewDesignerName] = useState("");
  const [newPosition, setNewPosition] = useState("디자이너"); // 기본 직급
  const [submitting, setSubmitting] = useState(false);

  // 브라우저 쿠키에서 토큰 가져오기 유틸 함수
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };

  // 🔄 디자이너 목록 페칭 (GET)
  const fetchDesigners = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/designers", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok)
        throw new Error("디자이너 리스트를 가져오는데 실패했습니다.");
      const data = await res.json();

      // API 설계 규격에 따라 데이터 매핑 (예상 구조: { success: true, data: [...] })
      if (data.success) {
        setDesigners(data.data || data.designers || []);
      } else {
        throw new Error(data.error || "목록 로드 실패");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigners();
  }, []);

  // ➕ 신규 디자이너 등록 제출 처리 (POST)
  const handleCreateDesigner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignerName.trim()) return;

    setSubmitting(true);
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/designers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          designerName: newDesignerName,
          position: newPosition,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "디자이너 등록에 실패했습니다.");
      }

      // 등록 성공 시 상태 초기화 및 창 닫기, 리스트 리로드
      setNewDesignerName("");
      setNewPosition("디자이너");
      setIsModalOpen(false);
      fetchDesigners(); // 리스트 새로고침
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDesignerStatus = async (
    designerId: number,
    currentStatus: boolean,
  ) => {
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/designers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          designerId,
          isActive: !currentStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "상태 변경 실패");

      // 리스트 갱신
      fetchDesigners();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteDesigner = async (designerId: number) => {
    if (
      !confirm(
        "정말 이 디자이너를 명단에서 삭제하시겠습니까?\n삭제 시 이전 예약 배정 기록이 영향을 받을 수 있습니다.",
      )
    )
      return;

    try {
      const token = getCookie("token");
      const res = await fetch(`/api/v1/designers?designerId=${designerId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제 실패");

      fetchDesigners();
    } catch (err: any) {
      alert(err.message);
    }
  };
  return (
    <div className="p-6 md:p-10 font-sans antialiased text-slate-800">
      {/* 1. 상단 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            디자이너 설정
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            우리 매장의 디자이너 리스트를 등록하고 예약 활성화 상태를
            편집합니다.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-600/10 active:scale-98 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>신규 디자이너 등록</span>
        </button>
      </div>

      {/* 2. 메인 컨텐츠 영역 */}
      {loading ? (
        // 로딩 스피너 구역
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-400 mt-3 font-medium">
            디자이너 명단을 매핑하는 중...
          </p>
        </div>
      ) : error ? (
        // 에러 표시 구역
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm text-center">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            명단을 불러오지 못했습니다
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
          <button
            onClick={fetchDesigners}
            className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : designers.length === 0 ? (
        // 빈 데이터 구역 (Empty State)
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px]">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            등록된 디자이너가 없습니다
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            오른쪽 상단 버튼을 클릭해 첫 번째 디자이너를 등록하고 예약을
            접수받아 보세요!
          </p>
        </div>
      ) : (
        // 진짜 디자이너 리스트 그리드/테이블 레이아웃
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">디자이너 프로필</th>
                  <th className="px-6 py-4">직급 (Position)</th>
                  <th className="px-6 py-4">등록 일자</th>
                  <th className="px-6 py-4">노출 상태</th>
                  <th className="px-6 py-4 text-center">동작</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {designers.map((designer) => (
                  <tr
                    key={designer.designerId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* 아바타 & 이름 */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shadow-inner">
                          {designer.designerName.charAt(0)}
                        </div>
                        <span>{designer.designerName}</span>
                      </div>
                    </td>
                    {/* 직급 태그 */}
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200/50">
                        {designer.position}
                      </span>
                    </td>
                    {/* 등록일 */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {new Date(designer.createdAt).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        },
                      )}
                    </td>
                    {/* 현재 활성화 여부 배지 */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          designer.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {designer.isActive !== false ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-0.5" />
                            예약 가능
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-0.5" />
                            예약 중지
                          </>
                        )}
                      </span>
                    </td>
                    {/* 관리 액션 버튼 */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          toggleDesignerStatus(
                            designer.designerId,
                            designer.isActive !== false,
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-900 transition-colors cursor-pointer"
                      >
                        {designer.isActive !== false
                          ? "예약 중지하기"
                          : "예약 활성화"}
                      </button>
                      <span className="text-slate-200">|</span>
                      <button
                        onClick={() => deleteDesigner(designer.designerId)}
                        className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ✨ 신규 등록 레이어 모달 (Overlay Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100">
            {/* 모달 헤더 */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">신규 디자이너 등록</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 모달 바디 / 폼 */}
            <form onSubmit={handleCreateDesigner}>
              <div className="p-6 space-y-4">
                {/* 1. 디자이너명 입력필드 */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    디자이너 실명
                  </label>
                  <input
                    type="text"
                    required
                    value={newDesignerName}
                    onChange={(e) => setNewDesignerName(e.target.value)}
                    placeholder="예: 김선우"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* 2. 직급 셀렉트 박스 */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    직급 설정
                  </label>
                  <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-700"
                  >
                    <option value="원장">원장 (Director)</option>
                    <option value="부원장">부원장</option>
                    <option value="수석 디자이너">수석 디자이너</option>
                    <option value="실장">실장</option>
                    <option value="디자이너">디자이너 (Designer)</option>
                    <option value="인턴">인턴/파트너</option>
                  </select>
                </div>
              </div>

              {/* 모달 푸터 액션 */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>추가하기</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
