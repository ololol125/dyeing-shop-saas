import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 🗂️ 파트너(오너)가 SaaS 대시보드에서 관리하는 자기 매장 게시물 목록 (GET, 로그인 필요)
 * 공개/비공개(DRAFT) 상태와 무관하게 전부 반환합니다.
 */
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: user.userId },
      select: { shopId: true },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장이 없습니다. 매장을 먼저 등록해 주세요." },
        { status: 404 },
      );
    }

    const posts = await prisma.post.findMany({
      where: { shopId: shop.shopId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("🚨 내 매장 게시물 목록 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
