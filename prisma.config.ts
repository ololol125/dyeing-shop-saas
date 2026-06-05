import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// CLI 터미널 환경에서도 .env 환경 변수를 확실하게 강제 로드합니다.
dotenv.config();

export default defineConfig({
  // ⚡ Prisma 7 정석: directUrl 속성은 datasource 객체 최상단이 아니라
  // 'provider'와 함께 명시적인 데이터베이스 연결 정의 구조로 묶어주어야 컴파일 에러가 나지 않습니다.
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-ignore - Prisma 7.8.0 기준 tsconfig와 wasm 엔진의 일시적인 타입 매핑 불일치 방지
    directUrl: process.env.DIRECT_URL,
  },
});
