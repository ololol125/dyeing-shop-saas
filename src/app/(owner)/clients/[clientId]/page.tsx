"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, User, FileText, CalendarDays } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  SectionTitle,
} from "@/components/owner/ui";
import { authHeaders, errorMessage, formatKstFullDate, formatWon, menuLabel } from "@/lib/client-utils";

interface HistoryItem {
  historyId: number;
  treatmentDate: string;
  treatmentNote: string;
  menuType: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
}

interface ClientProfile {
  name: string;
  phone: string | null;
}

export default function ClientHistoryPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  // Next.js 동적 라우팅 params 언랩
  const { clientId } = use(params);
  const router = useRouter();

  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchClientHistories = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/v1/histories?clientId=${clientId}`, {
          headers: authHeaders(),
        });

        if (!res.ok) throw new Error("손님 시술 기록을 가져오지 못했습니다.");

        const resData = await res.json();
        if (resData.success) {
          const fetchedData: HistoryItem[] = resData.data || [];
          setHistories(fetchedData);
          setClient(
            fetchedData.length > 0
              ? { name: fetchedData[0].customerName, phone: fetchedData[0].customerPhone }
              : { name: "처음 오신 손님", phone: null },
          );
        } else {
          throw new Error(resData.error || "손님 시술 기록을 가져오지 못했습니다.");
        }
      } catch (err) {
        console.error(err);
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchClientHistories();
  }, [clientId, reloadKey]);

  const backButton = (
    <Button variant="ghost" icon={ArrowLeft} onClick={() => router.back()} className="-ml-3 mb-4">
      예약 관리로 돌아가기
    </Button>
  );

  if (loading) {
    return (
      <PageContainer narrow>
        <LoadingState text="손님 시술 기록을 불러오는 중입니다" />
      </PageContainer>
    );
  }

  if (error || !client) {
    return (
      <PageContainer narrow>
        {backButton}
        <Card>
          <ErrorState
            message={error || "손님 정보를 찾을 수 없어요."}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      {backButton}

      {/* 손님 정보 */}
      <Card className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <User className="h-8 w-8" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-display font-bold text-ink">{client.name} 손님</h1>
            <p className="text-body text-ink-sub">지금까지 시술 {histories.length}번</p>
          </div>
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="inline-flex min-h-touch items-center gap-2 rounded-control border-2 border-brand px-5 text-button font-bold text-brand hover:bg-brand-soft"
            >
              <Phone className="h-5 w-5" aria-hidden />
              {client.phone}
            </a>
          )}
        </div>
      </Card>

      {/* 시술 기록 */}
      <SectionTitle>시술 기록</SectionTitle>

      {histories.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="아직 시술 기록이 없어요"
            description="예약 관리에서 '시술 완료'를 누르고 메모를 남기면 여기에 쌓여요."
          />
        </Card>
      ) : (
        <ol className="space-y-4">
          {histories.map((item) => (
            <li key={item.historyId}>
              <Card>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 text-heading font-bold text-ink">
                      <CalendarDays className="h-5 w-5 text-ink-sub" aria-hidden />
                      {formatKstFullDate(item.treatmentDate)}
                    </span>
                    <span className="rounded-badge bg-brand-soft px-3 py-1 text-caption font-bold text-brand">
                      {menuLabel(item.menuType)}
                    </span>
                  </div>
                  <span className="text-heading font-bold tabular-nums text-ink">{formatWon(item.totalAmount)}</span>
                </div>
                <p className="whitespace-pre-wrap text-body leading-relaxed text-ink">{item.treatmentNote}</p>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </PageContainer>
  );
}
