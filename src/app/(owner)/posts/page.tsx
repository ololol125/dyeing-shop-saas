"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Newspaper,
  Plus,
  Loader2,
  X,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
  ImagePlus,
  Eye,
  EyeOff,
} from "lucide-react";

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

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getCookie("token");
      const res = await fetch("/api/v1/posts/mine", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (res.status === 404) {
        setError("등록된 매장이 없습니다. 매장을 먼저 등록해 주세요.");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "게시물 목록을 가져오지 못했습니다.");
      }

      setPosts(data.data || []);
    } catch (err: any) {
      setError(err.message);
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
      const token = getCookie("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", status);
      if (imageFile) formData.append("image", imageFile);

      const url = editingPost
        ? `/api/v1/posts/${editingPost.postId}`
        : "/api/v1/posts";
      const method = editingPost ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "게시물 저장에 실패했습니다.");
      }

      setIsModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (postId: number) => {
    if (!confirm("정말 이 게시물을 삭제하시겠습니까?\n소비자 앱 피드에서도 즉시 사라집니다.")) return;

    try {
      const token = getCookie("token");
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제 실패");

      fetchPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 md:p-10 font-sans antialiased text-slate-800">
      {/* 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            게시물 관리
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            소비자 앱(염색온) 홈 화면 피드에 노출되는 매장 게시물을 등록하고
            관리합니다.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-violet-600/10 active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>새 게시물 작성</span>
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          <p className="text-xs text-slate-400 mt-3 font-medium">
            게시물 목록을 불러오는 중...
          </p>
        </div>
      ) : error ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm text-center">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            목록을 불러오지 못했습니다
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px]">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            등록된 게시물이 없습니다
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            오른쪽 상단 버튼을 클릭해 소비자 앱 홈 화면에 노출될 첫 게시물을
            등록해 보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              <div className="relative w-full h-40 bg-slate-100">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                )}
                <span
                  className={`absolute top-3 left-3 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                    post.status === "PUBLISHED"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {post.status === "PUBLISHED" ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  <span>{post.status === "PUBLISHED" ? "공개중" : "비공개"}</span>
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                  {post.content || "소개 내용이 없습니다."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(post)}
                      className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePost(post.postId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 작성/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-violet-100 text-violet-600 rounded-lg">
                  <Newspaper className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {editingPost ? "게시물 수정" : "새 게시물 작성"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* 메인 사진 업로드 */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    매장 메인 사진
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center overflow-hidden hover:border-violet-300 transition-colors cursor-pointer"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="미리보기"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <ImagePlus className="w-6 h-6 mb-1.5" />
                        <span className="text-xs font-medium">
                          사진을 선택해 주세요
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* 제목 */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    게시물 제목
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 뿌리염색 전문, 영현 헤어"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                  />
                </div>

                {/* 소개 내용 */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    소개 내용
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    placeholder="매장 소개, 이벤트, 시술 특징 등을 자유롭게 작성해 주세요."
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all resize-none"
                  />
                </div>

                {/* 공개 상태 */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    노출 상태
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all text-slate-700"
                  >
                    <option value="PUBLISHED">공개 (소비자 앱에 노출)</option>
                    <option value="DRAFT">비공개 (임시 저장)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>{editingPost ? "수정 완료" : "게시하기"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
