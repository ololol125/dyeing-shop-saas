// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ⚡ Prisma 7 정석: 내부 인자값 설정을 모두 비워두어야 'never' 에러가 나지 않습니다.
// 주소 바인딩은 우리가 이미 만들어둔 `prisma.config.ts`가 뒤에서 알아서 처리합니다.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
