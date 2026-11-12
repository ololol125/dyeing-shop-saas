import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "회원 탈퇴 안내 | 염색온",
};

// 계정 삭제 안내 (Google Play '계정 삭제 요청 URL' 용)
export default function AccountDeletionPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-10 text-ink antialiased">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-8 inline-block">
          <Logo size={44} />
        </Link>

        <div className="space-y-8 rounded-card border border-line bg-surface p-6 sm:p-10">
          <div>
            <h1 className="text-display font-bold">염색온 회원 탈퇴 안내</h1>
            <p className="mt-2 text-body text-ink-sub">염색온 앱 계정과 개인정보를 삭제하는 방법이에요.</p>
          </div>

          <section>
            <h2 className="text-heading font-bold">1. 앱에서 직접 탈퇴하기</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-6 text-body leading-relaxed">
              <li>염색온 앱에 로그인합니다.</li>
              <li>화면 아래 <b>내 정보</b>를 누릅니다.</li>
              <li>맨 아래 <b>회원 탈퇴</b>를 누르고 안내에 따라 확인합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-heading font-bold">2. 앱을 쓸 수 없는 경우</h2>
            <p className="mt-3 text-body leading-relaxed">
              가입한 이메일 주소와 이름을 알려 주시면 확인 후 탈퇴를 처리해 드려요.
              <br />
              고객센터:{" "}
              <a href="tel:053-957-6388" className="font-bold text-brand underline underline-offset-4">
                053-957-6388
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-heading font-bold">3. 탈퇴하면 삭제되는 정보</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-body leading-relaxed">
              <li>이름, 이메일 주소, 휴대폰 번호, 비밀번호</li>
              <li>매장에 남은 시술 기록(메모)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading font-bold">4. 법에 따라 보관하는 정보</h2>
            <p className="mt-3 text-body leading-relaxed">
              전자상거래법에 따라 결제·예약 기록은 <b>5년간</b> 보관한 뒤 삭제해요. 이 기록은 누구의 것인지 알 수 없도록
              이름과 연락처를 지운 상태로 보관합니다.
            </p>
          </section>

          <p className="text-body text-ink-sub">
            다가오는 예약이 있으면 탈퇴할 수 없어요. 매장에 연락해 예약을 정리한 뒤 탈퇴해 주세요. 자세한 내용은{" "}
            <Link href="/privacy" className="font-bold text-brand underline underline-offset-4">
              개인정보처리방침
            </Link>
            을 확인해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
