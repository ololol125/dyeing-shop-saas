"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Newspaper,
  Plus,
  Check,
  Pencil,
  Trash2,
  ImagePlus,
  Eye,
  EyeOff,
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

interface Post {
  postId: number;
  title: string;
  content: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/posts/mine", { headers: authHeaders() });
      const data = await res.json();

      if (res.status === 404) {
        setError("등록된 매장이 없어요. '매장 정보'에서 매장을 먼저 등록해 주세요.");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "매장 소식을 가져오지 못했습니다.");
      }

      setPosts(data.data || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setTitle("");
    setContent("");
    setStatus("PUBLISHED");
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content || "");
    setStatus(post.status);
    setImageFile(null);
    setImagePreview(post.imageUrl);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", status);
      if (imageFile) formData.append("image", imageFile);

      const url = editingPost ? `/api/v1/posts/${editingPost.postId}` : "/api/v1/posts";
      const method = editingPost ? "PATCH" : "POST";

      const res = await fetch(url, { method, headers: authHeaders(), body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "매장 소식을 저장하지 못했습니다.");
      }

      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (post: Post) => {
    if (!confirm(`'${post.title}' 소식을 삭제할까요?\n손님 앱에서도 바로 사라집니다.`)) return;

    try {
      const res = await fetch(`/api/v1/posts/${post.postId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제하지 못했습니다.");

      fetchPosts();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <PageContainer>
      <PageHeader
        title="매장 소식 올리기"
        description="올린 사진과 글은 손님 앱의 매장 화면에 보여요. 가장 최근 사진이 매장 대표 사진이 돼요."
        action={
          <Button icon={Plus} onClick={openCreateModal}>
            새 소식 쓰기
          </Button>
        }
      />

      {loading ? (
        <Card>
          <LoadingState text="매장 소식을 불러오는 중입니다" />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={fetchPosts} />
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Newspaper}
            title="아직 올린 소식이 없어요"
            description="매장 사진과 함께 첫 소식을 올려 보세요. 사진이 있으면 손님 앱에서 매장이 더 눈에 띄어요."
            action={
              <Button icon={Plus} onClick={openCreateModal}>
                첫 소식 쓰기
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const published = post.status === "PUBLISHED";
            return (
              <Card key={post.postId} padded={false} className="flex flex-col overflow-hidden">
                <div className="relative aspect-video w-full bg-brand-soft">
                  {post.imageUrl ? (
                    <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand">
                      <ImagePlus className="h-10 w-10" aria-hidden />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3">
                    {published ? (
                      <Badge icon={Eye} className="border-success/30 bg-success-soft text-success">
                        손님에게 보이는 중
                      </Badge>
                    ) : (
                      <Badge icon={EyeOff} className="border-line-strong/40 bg-canvas text-ink-sub">
                        숨김 (임시 저장)
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-heading font-bold text-ink">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-body text-ink-sub">
                    {post.content || "내용 없음"}
                  </p>
                  <p className="mt-3 text-caption text-ink-sub">{formatKstFullDate(post.createdAt)} 작성</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="secondary" icon={Pencil} onClick={() => openEditModal(post)}>
                      고치기
                    </Button>
                    <Button variant="danger" icon={Trash2} onClick={() => deletePost(post)}>
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 작성 / 수정 팝업 */}
      {isModalOpen && (
        <Modal
          title={editingPost ? "소식 고치기" : "새 소식 쓰기"}
          onClose={closeModal}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeModal}>
                취소
              </Button>
              <Button
                type="submit"
                form="post-form"
                icon={Check}
                loading={submitting}
                loadingText="저장하고 있어요"
              >
                {editingPost ? "고친 내용 저장" : "올리기"}
              </Button>
            </>
          }
        >
          <form id="post-form" onSubmit={handleSubmit} className="space-y-5">
            <Field label="사진" hint="매장 내부나 시술 사진을 올려 주세요.">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-control border-2 border-dashed border-line-strong bg-canvas hover:border-brand"
              >
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="선택한 사진" fill className="object-cover" />
                    <span className="absolute bottom-3 right-3 rounded-control bg-ink/80 px-3 py-1.5 text-body font-semibold text-white">
                      사진 바꾸기
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-body font-semibold text-ink">
                    <ImagePlus className="h-8 w-8 text-brand" aria-hidden />
                    눌러서 사진 고르기
                  </span>
                )}
              </button>
            </Field>

            <Field label="제목" htmlFor="post-title">
              <input
                id="post-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 이번 주 뿌리 염색 할인"
                className={inputClass}
              />
            </Field>

            <Field label="내용" htmlFor="post-content">
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="매장 소개, 이벤트, 시술 특징 등을 적어 주세요."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <fieldset>
              <legend className="mb-2 text-body font-semibold text-ink">손님에게 보이기</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { value: "PUBLISHED", label: "바로 보이기", Icon: Eye },
                  { value: "DRAFT", label: "숨겨 두기", Icon: EyeOff },
                ].map((opt) => {
                  const checked = status === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex min-h-touch cursor-pointer items-center gap-3 rounded-control border-[1.5px] px-4 ${
                        checked ? "border-brand bg-brand-soft" : "border-line-strong hover:bg-canvas"
                      }`}
                    >
                      <input
                        type="radio"
                        name="post-status"
                        value={opt.value}
                        checked={checked}
                        onChange={() => setStatus(opt.value)}
                        className="h-5 w-5 accent-brand"
                      />
                      <opt.Icon className="h-5 w-5 text-ink-sub" aria-hidden />
                      <span className="text-body font-semibold text-ink">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
