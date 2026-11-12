"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { AuthShell } from "@/components/owner/auth-shell";
import { Button, Field, Notice, inputClass } from "@/components/owner/ui";
import { errorMessage } from "@/lib/client-utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "이메일 또는 비밀번호를 다시 확인해 주세요.");
      }

      // API가 쿠키를 직접 설정하지 않는 경우를 대비해 토큰을 브라우저 쿠키에 저장
      if (data.token) {
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict;`;
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
    <AuthShell
      title="사장님 로그인"
      description="매장 예약과 정보를 관리하려면 로그인해 주세요."
      footer={
        <>
          처음이신가요?{" "}
          <Link href="/signup" className="inline-flex min-h-touch items-center font-bold text-brand underline underline-offset-4">
            사장님 회원가입
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleLogin}>
        {error && <Notice tone="error">{error}</Notice>}

        <Field label="이메일 주소" htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
            className={inputClass}
          />
        </Field>

        <Field label="비밀번호" htmlFor="login-password">
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-24`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-1 my-1 cursor-pointer rounded-control px-4 text-body font-bold text-brand hover:bg-brand-soft"
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          </div>
        </Field>

        <Button type="submit" icon={LogIn} loading={loading} loadingText="로그인하고 있어요" full>
          로그인
        </Button>
      </form>
    </AuthShell>
  );
}
