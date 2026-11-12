"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Store, Check, ArrowRight } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Notice,
  PageContainer,
  PageHeader,
  SectionTitle,
  inputClass,
} from "@/components/owner/ui";
import { authHeaders, errorMessage } from "@/lib/client-utils";

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
  const [saveError, setSaveError] = useState("");

  const [shopName, setShopName] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [rootPrice, setRootPrice] = useState("");
  const [fullPrice, setFullPrice] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [businessHours, setBusinessHours] = useState("");

  const fetchShop = async () => {
    setLoading(true);
    setError("");
    setNoShop(false);
    try {
      const res = await fetch("/api/v1/shops/mine", { headers: authHeaders() });
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
    } catch (err) {
      setError(errorMessage(err));
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
    setSaveError("");
    try {
      const res = await fetch("/api/v1/shops", {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
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
        throw new Error(data.error || "매장 정보를 저장하지 못했습니다.");
      }

      // 저장 완료 안내는 사장님이 확인할 수 있도록 자동으로 사라지지 않게 둔다
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // 입력이 바뀌면 '저장했어요' 안내는 지운다
  const edit = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaveSuccess(false);
    setter(e.target.value);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState text="매장 정보를 불러오는 중입니다" />
      </PageContainer>
    );
  }

  if (noShop) {
    return (
      <PageContainer narrow>
        <Card>
          <EmptyState
            icon={Store}
            title="먼저 매장을 등록해 주세요"
            description="매장을 등록하시면 손님 앱에 보이는 정보를 여기서 고칠 수 있어요."
            action={
              <Link
                href="/shop/register"
                className="inline-flex min-h-touch items-center gap-2 rounded-control bg-brand px-6 text-button font-bold text-white hover:bg-brand-pressed"
              >
                매장 등록하러 가기
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  if (error || !shop) {
    return (
      <PageContainer narrow>
        <Card>
          <ErrorState message={error || "매장 정보를 가져오지 못했습니다."} onRetry={fetchShop} />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader title="매장 정보" description="손님 앱(염색온)에 보이는 매장 정보를 고칠 수 있어요." />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <SectionTitle>손님에게 보이는 정보</SectionTitle>
          <div className="space-y-5">
            <Field label="매장 이름" htmlFor="shop-name">
              <input id="shop-name" type="text" required value={shopName} onChange={edit(setShopName)} className={inputClass} />
            </Field>
            <Field label="매장 소개" htmlFor="shop-desc" hint="손님 앱의 매장 화면 맨 위에 보여요.">
              <textarea
                id="shop-desc"
                value={description}
                onChange={edit(setDescription)}
                rows={4}
                placeholder="예) 신림역 3번 출구 앞, 20년 경력 원장이 직접 염색해 드립니다."
                className={`${inputClass} resize-none`}
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="매장 전화번호" htmlFor="shop-phone" hint="손님이 앱에서 바로 전화를 걸 수 있어요.">
                <input id="shop-phone" type="tel" value={phone} onChange={edit(setPhone)} placeholder="02-1234-5678" className={inputClass} />
              </Field>
              <Field label="영업시간" htmlFor="shop-hours">
                <input id="shop-hours" type="text" value={businessHours} onChange={edit(setBusinessHours)} placeholder="매일 오전 9시 ~ 오후 9시" className={inputClass} />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>시술 가격</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="뿌리 염색 (원)" htmlFor="root-price">
              <input id="root-price" type="number" inputMode="numeric" min={0} value={rootPrice} onChange={edit(setRootPrice)} className={inputClass} />
            </Field>
            <Field label="전체 염색 (원)" htmlFor="full-price">
              <input id="full-price" type="number" inputMode="numeric" min={0} value={fullPrice} onChange={edit(setFullPrice)} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card>
          <SectionTitle>위치</SectionTitle>
          <div className="space-y-5">
            <Field label="매장 주소" htmlFor="shop-address">
              <input id="shop-address" type="text" required value={baseAddress} onChange={edit(setBaseAddress)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="위도" htmlFor="shop-lat">
                <input id="shop-lat" type="number" step="any" required value={latitude} onChange={edit(setLatitude)} className={inputClass} />
              </Field>
              <Field label="경도" htmlFor="shop-lng">
                <input id="shop-lng" type="number" step="any" required value={longitude} onChange={edit(setLongitude)} className={inputClass} />
              </Field>
            </div>
            <p className="text-caption text-ink-sub">
              위도·경도는 손님 앱 지도에 매장을 표시할 때 써요. 주소를 옮기실 때만 바꿔 주세요.
            </p>
            <Field label="사업자 등록번호" htmlFor="shop-bizno" hint="사업자 등록번호는 바꿀 수 없어요.">
              <input id="shop-bizno" type="text" readOnly value={shop.businessNumber} className={inputClass} />
            </Field>
          </div>
        </Card>

        {saveError && <Notice tone="error">{saveError}</Notice>}
        {saveSuccess && <Notice tone="success">저장했어요. 손님 앱에 바로 반영됩니다.</Notice>}

        <div className="flex justify-end">
          <Button type="submit" icon={Check} loading={saving} loadingText="저장하고 있어요" className="w-full sm:w-auto">
            변경한 내용 저장하기
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
