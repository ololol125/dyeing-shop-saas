// src/app/(owner)/designers/page.tsx
import React from "react";
import { Users, UserPlus } from "lucide-react";

export default function DesignersPage() {
  return (
    <div className="p-6 md:p-10 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            디자이너 설정
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            우리 매장의 디자이너 리스트를 등록하고 편집합니다.
          </p>
        </div>
        <button className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10">
          <UserPlus className="w-4 h-4" />
          <span>신규 디자이너 등록</span>
        </button>
      </div>

      {/* 디자이너 목록 준비 구역 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
        <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          등록된 디자이너가 없습니다
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
          첫 번째 디자이너를 등록하고 예약을 접수받아 보세요!
        </p>
      </div>
    </div>
  );
}
