"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Check,
  UserCheck,
  UserX,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Modal,
  PageContainer,
  PageHeader,
  inputClass,
} from "@/components/owner/ui";
import { authHeaders, errorMessage, formatKstFullDate } from "@/lib/client-utils";

interface Designer {
  designerId: number;
  designerName: string;
  position: string;
  isActive: boolean;
  createdAt: string;
}

const positions = ["원장", "부원장", "수석 디자이너", "실장", "디자이너", "인턴"];

export default function DesignersPage() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 등록 팝업 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDesignerName, setNewDesignerName] = useState("");
  const [newPosition, setNewPosition] = useState("디자이너"); // 기본 직급
  const [submitting, setSubmitting] = useState(false);

  // 디자이너 목록 (GET)
  const fetchDesigners = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/designers", { headers: authHeaders() });
      if (!res.ok) throw new Error("선생님 목록을 가져오지 못했습니다.");
      const data = await res.json();

      if (data.success) {
        setDesigners(data.data || data.designers || []);
      } else {
        throw new Error(data.error || "선생님 목록을 가져오지 못했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigners();
  }, []);

  // 새 디자이너 등록 (POST)
  const handleCreateDesigner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignerName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/designers", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          designerName: newDesignerName,
          position: newPosition,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "선생님을 등록하지 못했습니다.");
      }

      setNewDesignerName("");
      setNewPosition("디자이너");
      setIsModalOpen(false);
      fetchDesigners();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // 예약 받기 / 멈추기 (PATCH)
  const toggleDesignerStatus = async (designerId: number, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/v1/designers", {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ designerId, isActive: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "상태를 바꾸지 못했습니다.");

      fetchDesigners();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const deleteDesigner = async (designer: Designer) => {
    if (
      !confirm(
        `${designer.designerName} 선생님을 목록에서 삭제할까요?\n삭제하면 지난 예약의 담당 기록에도 영향이 있을 수 있어요.\n잠시 쉬는 경우라면 '예약 멈추기'를 권해요.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/v1/designers?designerId=${designer.designerId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제하지 못했습니다.");

      fetchDesigners();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <PageContainer>
      <PageHeader
        title="선생님(디자이너) 관리"
        description="손님이 앱에서 고를 수 있는 담당 선생님 목록이에요."
        action={
          <Button icon={UserPlus} onClick={() => setIsModalOpen(true)}>
            선생님 추가
          </Button>
        }
      />

      <Card padded={false}>
        {loading ? (
          <LoadingState text="선생님 목록을 불러오는 중입니다" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchDesigners} />
        ) : designers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="등록된 선생님이 없어요"
            description="선생님을 등록해야 손님이 앱에서 예약할 수 있어요."
            action={
              <Button icon={UserPlus} onClick={() => setIsModalOpen(true)}>
                첫 선생님 추가하기
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {designers.map((designer) => {
              const active = designer.isActive !== false;
              return (
                <li
                  key={designer.designerId}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:p-6"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-heading font-bold text-brand">
                      {designer.designerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-heading font-bold text-ink">
                        {designer.designerName}
                        <span className="ml-2 text-body font-semibold text-ink-sub">{designer.position}</span>
                      </p>
                      <p className="text-caption text-ink-sub">
                        {formatKstFullDate(designer.createdAt)} 등록
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {active ? (
                      <Badge icon={UserCheck} className="border-success/30 bg-success-soft text-success">
                        예약 받는 중
                      </Badge>
                    ) : (
                      <Badge icon={UserX} className="border-warning/30 bg-warning-soft text-warning">
                        예약 멈춤
                      </Badge>
                    )}
                    <Button
                      variant="secondary"
                      icon={active ? PauseCircle : PlayCircle}
                      onClick={() => toggleDesignerStatus(designer.designerId, active)}
                    >
                      {active ? "예약 멈추기" : "예약 다시 받기"}
                    </Button>
                    <Button variant="danger" icon={Trash2} onClick={() => deleteDesigner(designer)}>
                      삭제
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* 선생님 추가 팝업 */}
      {isModalOpen && (
        <Modal
          title="선생님 추가"
          onClose={closeModal}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeModal}>
                취소
              </Button>
              <Button
                type="submit"
                form="designer-create-form"
                icon={Check}
                loading={submitting}
                loadingText="등록하고 있어요"
              >
                추가하기
              </Button>
            </>
          }
        >
          <form id="designer-create-form" onSubmit={handleCreateDesigner} className="space-y-5">
            <Field label="이름" htmlFor="designer-name" hint="손님 앱에 이 이름으로 보여요.">
              <input
                id="designer-name"
                type="text"
                required
                autoFocus
                value={newDesignerName}
                onChange={(e) => setNewDesignerName(e.target.value)}
                placeholder="예) 김선우"
                className={inputClass}
              />
            </Field>
            <Field label="직급" htmlFor="designer-position">
              <select
                id="designer-position"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className={inputClass}
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
