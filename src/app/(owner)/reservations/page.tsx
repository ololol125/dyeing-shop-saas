"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Phone,
  Scissors,
  CheckCircle2,
  UserPlus,
  UserCog,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Modal,
  PageContainer,
  PageHeader,
  ReservationStatusBadge,
  inputClass,
} from "@/components/owner/ui";
import {
  authHeaders,
  errorMessage,
  formatKstDate,
  formatKstTime,
  formatWon,
  menuLabel,
} from "@/lib/client-utils";

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

type Filter = "UPCOMING" | "DONE" | "ALL";

const filters: { key: Filter; label: string }[] = [
  { key: "UPCOMING", label: "방문 예정" },
  { key: "DONE", label: "완료·취소" },
  { key: "ALL", label: "이번 달 전체" },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [shopDesigners, setShopDesigners] = useState<DesignerBadge[]>([]); // 매장 전체 디자이너
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("UPCOMING");

  // 시술 완료 팝업 상태
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [treatmentNote, setTreatmentNote] = useState("");
  const [submittingHistory, setSubmittingHistory] = useState(false);

  // 담당 선생님 변경 팝업 상태
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
  const [targetResId, setTargetResId] = useState<number | null>(null);
  const [selectedDesignerIds, setSelectedDesignerIds] = useState<number[]>([]);
  const [updatingDesigner, setUpdatingDesigner] = useState(false);

  // 예약 목록 + 매장 디자이너 목록 함께 불러오기
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = authHeaders();
      const [resRes, desRes] = await Promise.all([
        fetch("/api/v1/reservations", { headers }),
        fetch("/api/v1/designers", { headers }),
      ]);
      const resData = await resRes.json();
      const desData = await desRes.json();

      if (resData.success && desData.success) {
        setReservations(resData.data || []);
        setShopDesigners(desData.data || []);
      } else {
        throw new Error(resData.error || desData.error || "예약 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 담당 선생님 변경 저장 (PATCH)
  const handleDesignerUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResId) return;

    setUpdatingDesigner(true);
    try {
      const res = await fetch("/api/v1/reservations", {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          reservationId: targetResId,
          designerIds: selectedDesignerIds, // 체크된 디자이너 ID 배열 전송
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success)
        throw new Error(resData.error || "담당 선생님을 바꾸지 못했습니다.");

      setIsDesignerModalOpen(false);
      setTargetResId(null);
      fetchData();
      alert("담당 선생님을 바꿨어요.");
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setUpdatingDesigner(false);
    }
  };

  const openDesignerModal = (resId: number, currentDesigners: DesignerBadge[]) => {
    setTargetResId(resId);
    // 현재 배정된 선생님을 미리 체크
    setSelectedDesignerIds(currentDesigners.map((d) => d.designerId));
    setIsDesignerModalOpen(true);
  };

  const openHistoryModal = (reservationId: number, clientId: number) => {
    setSelectedResId(Number(reservationId));
    setSelectedClientId(Number(clientId));
    setTreatmentNote("");
    setIsHistoryModalOpen(true);
  };

  // 시술 완료 저장 (POST)
  const handleCompleteHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId || !selectedClientId) return;

    setSubmittingHistory(true);
    try {
      const res = await fetch("/api/v1/histories", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          reservationId: selectedResId,
          clientId: selectedClientId,
          treatmentNote: treatmentNote,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.error || "시술 완료를 저장하지 못했습니다.");

      setIsHistoryModalOpen(false);
      fetchData();
      alert("시술 완료와 메모를 저장했어요.");
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setSubmittingHistory(false);
    }
  };

  const handleDesignerCheckboxChange = (id: number) => {
    setSelectedDesignerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const closeDesignerModal = useCallback(() => setIsDesignerModalOpen(false), []);
  const closeHistoryModal = useCallback(() => setIsHistoryModalOpen(false), []);

  const visible = reservations
    .filter((r) =>
      filter === "ALL" ? true : filter === "UPCOMING" ? r.status === "CONFIRMED" : r.status !== "CONFIRMED",
    )
    .sort((a, b) =>
      // 방문 예정은 가까운 순, 나머지는 최근 순
      filter === "UPCOMING"
        ? a.reservationTime.localeCompare(b.reservationTime)
        : b.reservationTime.localeCompare(a.reservationTime),
    );

  const countOf = (key: Filter) =>
    reservations.filter((r) =>
      key === "ALL" ? true : key === "UPCOMING" ? r.status === "CONFIRMED" : r.status !== "CONFIRMED",
    ).length;

  return (
    <PageContainer>
      <PageHeader
        title="예약 관리"
        description="이번 달 예약을 확인하고, 시술이 끝나면 '시술 완료'를 눌러 주세요."
        action={
          <Button variant="secondary" icon={RefreshCw} onClick={fetchData}>
            새로고침
          </Button>
        }
      />

      {/* 보기 선택 */}
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="예약 보기">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={`inline-flex min-h-touch cursor-pointer items-center gap-2 rounded-control px-5 text-body font-bold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "border-[1.5px] border-line-strong bg-surface text-ink hover:bg-brand-soft"
              }`}
            >
              {active && <CheckCircle2 className="h-5 w-5" aria-hidden />}
              {f.label}
              <span className={`rounded-full px-2 text-caption ${active ? "bg-white/20" : "bg-canvas"}`}>
                {loading ? "-" : countOf(f.key)}
              </span>
            </button>
          );
        })}
      </div>

      <Card padded={false}>
        {loading ? (
          <LoadingState text="예약을 불러오는 중입니다" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={filter === "UPCOMING" ? "방문 예정인 예약이 없어요" : "해당하는 예약이 없어요"}
            description="손님이 염색온 앱으로 예약하면 여기에 바로 보여요."
          />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((res) => (
              <li key={res.reservationId} className="grid gap-4 p-5 md:grid-cols-[11rem_1fr_auto] md:items-center md:p-6">
                {/* 언제 */}
                <div>
                  <p className="text-body font-semibold text-ink-sub">{formatKstDate(res.reservationTime)}</p>
                  <p className="text-title font-bold tabular-nums text-ink">{formatKstTime(res.reservationTime)}</p>
                </div>

                {/* 누가 / 무엇을 */}
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link
                      href={`/clients/${res.clientId}`}
                      className="text-heading font-bold text-ink underline-offset-4 hover:text-brand hover:underline"
                    >
                      {res.customerName} 손님
                    </Link>
                    <a
                      href={`tel:${res.customerPhone}`}
                      className="inline-flex items-center gap-1 text-body text-ink-sub hover:text-brand"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      {res.customerPhone}
                    </a>
                  </div>
                  <p className="text-body text-ink">
                    <span className="font-bold">{menuLabel(res.treatment)}</span>
                    <span className="text-ink-sub"> · </span>
                    <span className="font-bold tabular-nums">{formatWon(res.totalAmount)}</span>
                  </p>
                  {/* 담당 선생님 (눌러서 변경) */}
                  <button
                    onClick={() => openDesignerModal(res.reservationId, res.designers)}
                    className="inline-flex min-h-touch cursor-pointer flex-wrap items-center gap-2 rounded-control border-[1.5px] border-dashed border-line-strong px-3 py-2 text-left text-body hover:border-brand hover:bg-brand-soft"
                  >
                    {res.designers && res.designers.length > 0 ? (
                      <>
                        <Scissors className="h-5 w-5 text-ink-sub" aria-hidden />
                        <span className="font-semibold text-ink">
                          {res.designers.map((d) => `${d.designerName}(${d.position})`).join(", ")}
                        </span>
                        <span className="font-bold text-brand">· 바꾸기</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 text-warning" aria-hidden />
                        <span className="font-bold text-warning">담당 선생님 정하기</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 상태 / 할 일 */}
                <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
                  <ReservationStatusBadge status={res.status} />
                  {res.status !== "COMPLETED" && (
                    <Button
                      icon={CheckCircle2}
                      onClick={() => openHistoryModal(res.reservationId, res.clientId)}
                    >
                      시술 완료
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 담당 선생님 변경 팝업 */}
      {isDesignerModalOpen && (
          <Modal
            title="담당 선생님 바꾸기"
            onClose={closeDesignerModal}
            footer={
              <>
                <Button type="button" variant="secondary" onClick={closeDesignerModal}>
                  취소
                </Button>
                <Button
                  type="submit"
                  form="designer-form"
                  icon={UserCog}
                  loading={updatingDesigner}
                  loadingText="저장하고 있어요"
                >
                  저장하기
                </Button>
              </>
            }
          >
            <form id="designer-form" onSubmit={handleDesignerUpdateSubmit}>
            <p className="mb-4 text-body text-ink-sub">
              이 예약을 맡을 선생님을 골라 주세요. 여러 분을 고를 수 있어요.
            </p>
            {shopDesigners.length === 0 ? (
              <p className="text-body text-ink">
                등록된 선생님이 없어요. &lsquo;선생님(디자이너) 관리&rsquo;에서 먼저 등록해 주세요.
              </p>
            ) : (
              <div className="space-y-2">
                {shopDesigners.map((designer) => {
                  const checked = selectedDesignerIds.includes(designer.designerId);
                  return (
                    <label
                      key={designer.designerId}
                      className={`flex min-h-touch cursor-pointer items-center gap-3 rounded-control border-[1.5px] p-4 ${
                        checked ? "border-brand bg-brand-soft" : "border-line-strong bg-surface hover:bg-canvas"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleDesignerCheckboxChange(designer.designerId)}
                        className="h-6 w-6 shrink-0 cursor-pointer accent-brand"
                      />
                      <span className="text-body font-bold text-ink">{designer.designerName}</span>
                      <span className="text-body text-ink-sub">{designer.position}</span>
                    </label>
                  );
                })}
              </div>
            )}
            </form>
          </Modal>
      )}

      {/* 시술 완료 팝업 */}
      {isHistoryModalOpen && (
        <Modal
          title="시술 완료 처리"
          onClose={closeHistoryModal}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeHistoryModal}>
                취소
              </Button>
              <Button
                type="submit"
                form="history-form"
                icon={CheckCircle2}
                loading={submittingHistory}
                loadingText="저장하고 있어요"
              >
                완료로 저장
              </Button>
            </>
          }
        >
          <form id="history-form" onSubmit={handleCompleteHistorySubmit}>
            <Field
              label="시술 메모"
              htmlFor="treatment-note"
              hint="사용한 염색약 번호, 손님 요청 사항 등을 적어 두면 다음 방문 때 편해요."
            >
              <textarea
                id="treatment-note"
                required
                value={treatmentNote}
                onChange={(e) => setTreatmentNote(e.target.value)}
                placeholder="예) 7N 자연갈색, 뿌리 2cm, 두피 민감"
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
