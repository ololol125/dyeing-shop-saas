"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Scissors,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

interface HistoryItem {
  historyId: number;
  treatmentDate: string;
  treatmentNote: string;
  menuType: string;
  totalAmount: number;
  customerName: string; // 🟢 통합 API의 가공 필드 반영
  customerPhone: string; // 🟢 통합 API의 가공 필드 반영
}

interface ClientProfile {
  name: string;
  phone: string;
  email: string;
}

export default function ClientHistoryPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  // ⭕ Next.js 동적 라우팅 params 언랩 처리
  const { clientId } = use(params);
  const router = useRouter();

  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 📄 src/app/(owner)/clients/[clientId]/page.tsx 수정본 (useEffect 구역 전체)

  useEffect(() => {
    // 브라우저 쿠키에서 인증 토큰을 읽어오는 헬퍼 함수 추가
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const fetchClientHistories = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getCookie("token"); // 🔑 쿠키에서 토큰 추출

        // 🎯 헤더(headers)에 인증 토큰을 정상적으로 탑재하여 전송합니다.
        const res = await fetch(`/api/v1/histories?clientId=${clientId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok)
          throw new Error("고객 시술 이력을 불러오는 데 실패했습니다.");

        const resData = await res.json();
        if (resData.success) {
          const fetchedData = resData.data || [];
          setHistories(fetchedData);

          if (fetchedData.length > 0) {
            setClient({
              name: fetchedData[0].customerName,
              phone: fetchedData[0].customerPhone,
              email: "DyeingShop Premium 회원",
            });
          } else {
            setClient({
              name: "신규 방문 고객",
              phone: "정보는 예약 현황판 확인",
              email: "-",
            });
          }
        } else {
          throw new Error(resData.error || "차트 조회 실패");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchClientHistories();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 mt-4 font-medium">
          고객 정밀 차트를 분석 중입니다...
        </p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            차트를 불러올 수 없습니다
          </h3>
          <p className="text-xs text-rose-400 mt-1">
            {error || "존재하지 않는 회원 정보입니다."}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            이전 화면으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 font-sans antialiased text-slate-800">
      {/* 대시보드 복귀 내비게이션 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors text-xs font-bold mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>예약 현황판으로 돌아가기</span>
      </button>

      {/* 👤 1. 상단 고객 요약 정보 프로필 카드 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/10">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {client.name} 고객님 종합 차트
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              매장에 누적 적재된 시술 히스토리 리포트입니다.
            </p>
          </div>
        </div>

        {/* 연락처 및 식별 라벨 구역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono text-slate-700">{client.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate text-slate-700">{client.email}</span>
          </div>
        </div>
      </div>

      {/* 📜 2. 하단 시술 내역 타임라인 그래픽 트랙 */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
        시술 히스토리 타임라인
      </h3>

      {histories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[250px]">
          <FileText className="w-8 h-8 text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">
            기록된 시술 내역이 없습니다
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            예약 관리 보드에서 시술을 완료하시면 여기에 타임라인이 형성됩니다.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-4">
          {histories.map((item) => {
            const date = new Date(item.treatmentDate);
            return (
              <div key={item.historyId} className="relative pl-6">
                {/* 타임라인 포인트 그래픽 노드 */}
                <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white shadow-sm" />

                {/* 시술 상세 정보 블록 카드 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono font-bold text-slate-400 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-300" />
                        {date.toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {item.menuType === "FULL_DYE"
                          ? "전체 염색"
                          : item.menuType === "ROOT_DYE"
                            ? "뿌리 염색"
                            : item.menuType}
                      </span>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-slate-800 font-mono">
                      <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                      {item.totalAmount.toLocaleString()}원 결제
                    </div>
                  </div>

                  {/* 원장님이 기재한 시술 완료 메모 출력 칸 */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {item.treatmentNote}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
