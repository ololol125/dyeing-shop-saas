// src/app/layout.tsx
import React from "react";
import "./globals.css"; // 👈 이 구문이 반드시 포함되어 있어야 합니다!

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
