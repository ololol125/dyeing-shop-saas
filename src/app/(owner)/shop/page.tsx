"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Navigation,
  Banknote,
  Phone,
  Clock,
  FileText,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

interface ShopInfo {
  shopId: number;
  shopName: string;
  baseAddress: string;
  latitude: number;
  longitude: number;
  rootPrice: number;
  fullPrice: number;
  businessNumber: string;
  description: string | null;
  phone: string | null;
  businessHours: string | null;
}

export default function ShopInfoPage() {
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [noShop, setNoShop] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [shopName, setShopName] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [rootPrice, setRootPrice] = useState("");
  const [fullPrice, setFullPrice] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [businessHours, setBusinessHours] = useState("");

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };

  const fetchShop = async () => {
    setLoading(true);
    setError("");
    setNoShop(false);
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/shops/mine", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (res.status === 404) {
        setNoShop(true);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "매장 정보를 가져오지 못했습니다.");
      }

      const s: ShopInfo = data.data;
      setShop(s);
      setShopName(s.shopName);
      setBaseAddress(s.baseAddress);
      setLatitude(String(s.latitude));
      setLongitude(String(s.longitude));
      setRootPrice(String(s.rootPrice));
      setFullPrice(String(s.fullPrice));
      setDescription(s.description || "");
      setPhone(s.phone || "");
      setBusinessHours(s.businessHours || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/shops", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          shopName,
          baseAddress,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          rootPrice: rootPrice ? parseInt(rootPrice, 10) : 0,
          fullPrice: fullPrice ? parseInt(fullPrice, 10) : 0,
          description,
          phone,
          businessHours,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "매장 정보 수정에 실패했습니다.");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        <p className="text-xs text-slate-400 mt-3 font-medium">
          매장 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  if (noShop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            아직 등록된 매장이 없어요
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            매장 정보를 먼저 등록해야 소비자 앱에 노출되는 정보를 수정할 수
            있습니다.
          </p>
          <Link
            href="/shop/register"
            className="mt-5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center mx-auto space-x-1.5 transition-colors"
          >
            <span>매장 등록하러 가기</span>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            매장 정보를 불러올 수 없습니다
          </h3>
          <p className="text-xs text-rose-400 mt-1">{error}</p>
          <button
            onClick={fetchShop}
            className="mt-5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 font-sans antialiased text-slate-800">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          매장 정보 관리
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          소비자 앱(염색온)에 노출되는 매장 기본 정보를 수정합니다.
        </p>
      </div>

      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-5"
        >
          {/* 사업자 등록번호 (읽기 전용) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              사업자 등록번호 (수정 불가)
            </label>
            <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono">
              {shop.businessNumber}
            </div>
          </div>

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
                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
              />
            </div>
          </div>

          {/* 소개 내용 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              매장 소개
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="소비자 앱에 노출될 매장 소개 문구를 입력해 주세요."
                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all resize-none"
              />
            </div>
          </div>

          {/* 전화번호 / 영업시간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                매장 전화번호
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="02-1234-5678"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                영업시간
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  placeholder="매일 09:00 - 21:00"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
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
                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
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
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
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
                className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
              />
            </div>
          </div>

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
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
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
                className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
              />
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>저장되었습니다</span>
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center space-x-2 py-3 px-6 border border-transparent rounded-xl shadow-md shadow-violet-600/10 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>변경사항 저장</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
