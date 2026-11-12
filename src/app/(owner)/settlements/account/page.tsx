"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import {
  Button,
  Card,
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

const banks = [
  "KB국민은행", "신한은행", "우리은행", "하나은행", "NH농협은행", "IBK기업은행",
  "카카오뱅크", "토스뱅크", "케이뱅크", "SC제일은행", "한국씨티은행", "iM뱅크(대구은행)",
  "부산은행", "경남은행", "광주은행", "전북은행", "제주은행", "수협은행",
  "새마을금고", "신협", "우체국", "산림조합",
];

interface SavedAccount {
  ownerName: string;
  businessType: string;
  bankName: string;
  accountNumberLast4: string;
  accountHolder: string;
}

export default function SettlementAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState<SavedAccount | null>(null);

  const [ownerName, setOwnerName] = useState("");
  const [businessType, setBusinessType] = useState("INDIVIDUAL");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchAccount = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/v1/settlements/account", { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "정산 계좌 정보를 불러오지 못했습니다.");
      const account: SavedAccount | null = data.data;
      setSaved(account);
      if (account) {
        setOwnerName(account.ownerName);
        setBusinessType(account.businessType);
        setBankName(account.bankName);
        setAccountHolder(account.accountHolder);
      }
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/v1/settlements/account", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ownerName, businessType, bankName, accountNumber, accountHolder }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "정산 계좌를 저장하지 못했습니다.");
      alert("정산 계좌를 저장했어요.");
      router.push("/settlements");
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const backButton = (
    <Button variant="ghost" icon={ArrowLeft} onClick={() => router.push("/settlements")} className="-ml-3 mb-4">
      정산 화면으로 돌아가기
    </Button>
  );

  if (loading) {
    return (
      <PageContainer narrow>
        <LoadingState text="정산 계좌 정보를 불러오는 중입니다" />
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer narrow>
        {backButton}
        <Card>
          <ErrorState message={loadError} onRetry={fetchAccount} />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      {backButton}
      <PageHeader
        title={saved ? "정산 계좌 바꾸기" : "정산 계좌 등록"}
        description="매달 정산 금액을 받으실 계좌예요. 사업자 명의 계좌를 권해 드려요."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <SectionTitle>사업자 정보</SectionTitle>
          <div className="space-y-5">
            <Field label="대표자 이름" htmlFor="owner-name" hint="사업자등록증에 적힌 대표자 이름을 적어 주세요.">
              <input id="owner-name" type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
            </Field>
            <fieldset>
              <legend className="mb-2 text-body font-semibold text-ink">사업자 종류</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { value: "INDIVIDUAL", label: "개인 사업자" },
                  { value: "CORPORATE", label: "법인 사업자" },
                ].map((opt) => {
                  const checked = businessType === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex min-h-touch cursor-pointer items-center gap-3 rounded-control border-[1.5px] px-4 ${
                        checked ? "border-brand bg-brand-soft" : "border-line-strong hover:bg-canvas"
                      }`}
                    >
                      <input
                        type="radio"
                        name="business-type"
                        value={opt.value}
                        checked={checked}
                        onChange={() => setBusinessType(opt.value)}
                        className="h-5 w-5 accent-brand"
                      />
                      <span className="text-body font-semibold text-ink">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </Card>

        <Card>
          <SectionTitle>계좌 정보</SectionTitle>
          <div className="space-y-5">
            <Field label="은행" htmlFor="bank-name">
              <select id="bank-name" required value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass}>
                <option value="" disabled>
                  은행을 골라 주세요
                </option>
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="계좌번호"
              htmlFor="account-number"
              hint={
                saved
                  ? `지금 등록된 계좌: ${saved.bankName} ****${saved.accountNumberLast4} — 바꾸려면 새 계좌번호 전체를 적어 주세요.`
                  : "숫자만 적어 주세요. '-'는 빼도 돼요."
              }
            >
              <input
                id="account-number"
                type="text"
                inputMode="numeric"
                required
                autoComplete="off"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9-]/g, ""))}
                placeholder="예) 12345678901234"
                className={inputClass}
              />
            </Field>
            <Field label="예금주" htmlFor="account-holder" hint="통장에 적힌 이름과 똑같이 적어 주세요.">
              <input id="account-holder" type="text" required value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </Card>

        <p className="flex items-start gap-2 text-body text-ink-sub">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          계좌번호는 암호화해서 보관하고, 화면에는 끝 4자리만 보여 드려요.
        </p>

        {saveError && <Notice tone="error">{saveError}</Notice>}

        <Button type="submit" icon={Check} loading={saving} loadingText="저장하고 있어요" full>
          {saved ? "새 계좌로 저장하기" : "계좌 등록하기"}
        </Button>
      </form>
    </PageContainer>
  );
}
