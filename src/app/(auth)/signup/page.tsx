"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 📄 src/app/(auth)/signup/page.tsx 내부의 handleSignup 함수 수정

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          role: "SHOP_OWNER", // ⭕ 기존 "OWNER"에서 "SHOP_OWNER"로 변경!
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "회원가입에 실패했습니다. 입력값을 확인하세요.",
        );
      }

      // 가입 성공 시 로그인 화면으로 전환
      alert("회원가입이 완료되었습니다! 로그인을 진행해 주세요.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <Link
        href="/"
        className="absolute top-6 left-6 text-xl font-black tracking-tight text-violet-600 hover:text-violet-700 transition-colors"
      >
        염색온
      </Link>
      <div className="sm:mx-auto w-full max-w-lg">
        <div className="flex justify-center items-center space-x-3">
          <div className="relative w-12 h-12 p-2.5 bg-violet-600 rounded-2xl text-white shadow-lg shadow-violet-600/20">
              <Image
                src="/icon01.png"
                alt="염색온"
                fill
                priority
                className="object-cover"
              />
          </div>
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-violet-950 bg-clip-text text-transparent">
            염색온{" "}
            <span className="text-violet-600 font-bold text-base align-super">
              SaaS
            </span>
          </span>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          파트너 오너 가입하기
        </h2>
        <p className="mt-3 text-center text-base text-slate-500">
          헤어숍 관리 플랫폼과 함께 매장을 스마트하게 운영해 보세요.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto w-full max-w-lg">
        <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-14 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm font-semibold text-rose-600">
                ⚠️ {error}
              </div>
            )}

            {/* 이름 입력 */}
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                이름 (실명)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 이메일 입력 */}
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                이메일 주소
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 전화번호 입력 */}
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                전화번호
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                비밀번호
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상의 비밀번호 설정"
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
                />
              </div>
            </div>

            {/* 가입 완료 버튼 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-violet-600/10 text-base font-bold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>파트너 가입 신청</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 하단 링크 */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-base">
            <span className="text-slate-400">이미 계정이 있으신가요?</span>{" "}
            <Link
              href="/login"
              className="font-bold text-violet-600 hover:text-violet-500 transition-colors underline-offset-4 hover:underline"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
