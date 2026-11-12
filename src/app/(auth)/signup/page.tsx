"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/owner/auth-shell";
import { Button, Field, Notice, inputClass } from "@/components/owner/ui";
import { errorMessage } from "@/lib/client-utils";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          role: "SHOP_OWNER",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "가입하지 못했습니다. 입력한 내용을 확인해 주세요.");
      }

      alert("가입이 끝났어요. 방금 만든 이메일과 비밀번호로 로그인해 주세요.");
      router.push("/login");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="사장님 회원가입"
      description="가입 후 매장을 등록하면 염색온 앱으로 예약을 받을 수 있어요."
      footer={
        <>
          이미 가입하셨나요?{" "}
          <Link href="/login" className="inline-flex min-h-touch items-center font-bold text-brand underline underline-offset-4">
            로그인하기
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSignup}>
        {error && <Notice tone="error">{error}</Notice>}

        <Field label="이름" htmlFor="signup-name">
          <input id="signup-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className={inputClass} />
        </Field>

        <Field label="휴대폰 번호" htmlFor="signup-phone">
          <input id="signup-phone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" className={inputClass} />
        </Field>

        <Field label="이메일 주소" htmlFor="signup-email" hint="로그인할 때 아이디로 써요.">
          <input id="signup-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" className={inputClass} />
        </Field>

        <Field label="비밀번호" htmlFor="signup-password" hint="8자 이상으로 만들어 주세요.">
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
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

        <Button type="submit" icon={CheckCircle2} loading={loading} loadingText="가입하고 있어요" full>
          가입하기
        </Button>
      </form>
    </AuthShell>
  );
}
