"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  Hash,
  Navigation,
  Banknote,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function ShopRegisterPage() {
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [rootPrice, setRootPrice] = useState("");
  const [fullPrice, setFullPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          shopName,
          businessNumber,
          baseAddress,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          rootPrice: rootPrice ? parseInt(rootPrice, 10) : 0,
          fullPrice: fullPrice ? parseInt(fullPrice, 10) : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "매장 등록에 실패했습니다.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="sm:mx-auto w-full max-w-lg">
        <div className="flex justify-center items-center space-x-2.5">
          <div className="p-2.5 bg-violet-600 rounded-2xl text-white shadow-lg shadow-violet-600/20">
            <Store className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          매장 등록하기
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          첫 매장 정보를 입력하면 대시보드에서 예약과 디자이너를 관리할 수
          있어요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
                ⚠️ {error}
              </div>
            )}

            {/* 매장명 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                매장명
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="영현 바버샵"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 사업자 등록번호 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                사업자 등록번호
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  placeholder="123-45-67890"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                매장 주소
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={baseAddress}
                  onChange={(e) => setBaseAddress(e.target.value)}
                  placeholder="서울특별시 관악구 신림동 1554-29"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 위도 / 경도 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  위도 (Latitude)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="37.4750"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  경도 (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="126.9300"
                  className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>
            <p className="!mt-1.5 text-[11px] text-slate-400">
              네이버 지도 등에서 매장 위치를 검색해 위도·경도 좌표를
              확인해 주세요.
            </p>

            {/* 뿌리/전체 염색 가격 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  뿌리 염색 가격
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={rootPrice}
                    onChange={(e) => setRootPrice(e.target.value)}
                    placeholder="6000"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  전체 염색 가격
                </label>
                <input
                  type="number"
                  min={0}
                  value={fullPrice}
                  onChange={(e) => setFullPrice(e.target.value)}
                  placeholder="10000"
                  className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 등록 버튼 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-violet-600/10 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>매장 등록하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
