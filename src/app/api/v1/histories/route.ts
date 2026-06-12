import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // 🟢 공통 헬퍼 함수 임포트!

// 1. 📜 전체 시술 히스토리 목록 조회 (GET)
export async function GET(request: Request) {
  try {
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "인증이 유효하지 않거나 토큰이 누락되었습니다.",
        },
        { status: 401 },
      );
    }

    // 원장님의 매장 ID 조회
    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 조회 결과 반환...
    const histories = await prisma.hairHistory.findMany({
      where: { shopId: shop.shopId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, histories }, { status: 200 });
  } catch (error) {
    console.error("🚨 조회 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류" },
      { status: 500 },
    );
  }
}
