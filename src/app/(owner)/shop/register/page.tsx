"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  Button,
  Card,
  Field,
  Notice,
  PageContainer,
  PageHeader,
  SectionTitle,
  inputClass,
} from "@/components/owner/ui";
import { authHeaders, errorMessage } from "@/lib/client-utils";

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/shops", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
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
        throw new Error(data.error || "매장을 등록하지 못했습니다.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer narrow>
      <PageHeader
        title="매장 등록하기"
        description="매장 정보를 등록하시면 손님 앱에 매장이 보이고, 예약을 받을 수 있어요."
      />

      <form onSubmit={handleRegister} className="space-y-6">
        <Card>
          <SectionTitle>기본 정보</SectionTitle>
          <div className="space-y-5">
            <Field label="매장 이름" htmlFor="reg-name">
              <input id="reg-name" type="text" required value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="예) 영현 바버샵" className={inputClass} />
            </Field>
            <Field label="사업자 등록번호" htmlFor="reg-bizno" hint="등록 후에는 바꿀 수 없어요. 정확히 적어 주세요.">
              <input id="reg-bizno" type="text" required value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} placeholder="123-45-67890" className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card>
          <SectionTitle>시술 가격</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="뿌리 염색 (원)" htmlFor="reg-root">
              <input id="reg-root" type="number" inputMode="numeric" min={0} value={rootPrice} onChange={(e) => setRootPrice(e.target.value)} placeholder="6000" className={inputClass} />
            </Field>
            <Field label="전체 염색 (원)" htmlFor="reg-full">
              <input id="reg-full" type="number" inputMode="numeric" min={0} value={fullPrice} onChange={(e) => setFullPrice(e.target.value)} placeholder="10000" className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card>
          <SectionTitle>위치</SectionTitle>
          <div className="space-y-5">
            <Field label="매장 주소" htmlFor="reg-address">
              <input id="reg-address" type="text" required value={baseAddress} onChange={(e) => setBaseAddress(e.target.value)} placeholder="서울특별시 관악구 신림동 1554-29" className={inputClass} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="위도" htmlFor="reg-lat">
                <input id="reg-lat" type="number" step="any" required value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="37.4750" className={inputClass} />
              </Field>
              <Field label="경도" htmlFor="reg-lng">
                <input id="reg-lng" type="number" step="any" required value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="126.9300" className={inputClass} />
              </Field>
            </div>
            <p className="text-caption text-ink-sub">
              네이버 지도에서 매장을 검색한 뒤, 위치를 오른쪽 클릭하면 나오는 좌표(위도·경도)를 적어 주세요.
            </p>
          </div>
        </Card>

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" icon={CheckCircle2} loading={loading} loadingText="등록하고 있어요" full>
          매장 등록하기
        </Button>
      </form>
    </PageContainer>
  );
}
