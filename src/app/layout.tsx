// src/app/layout.tsx
import "./globals.css"; // 🚨 200% 중요: 이 한 줄이 있어야 프로젝트 전체에 테일윈드가 주입됩니다!
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}{" "}
        {/* 여기에 들어오는 dashboard/page.tsx 화면으로 스타일이 흘러들어갑니다! */}
      </body>
    </html>
  );
}
