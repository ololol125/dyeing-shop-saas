import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 🏬 로그인한 오너 본인의 매장 정보 전체 조회 (GET, 로그인 필요)
 * 매장 정보 수정 화면 초기값을 채우는 용도입니다.
 */
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다.",
        },
        { status: 401 },
      );
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: user.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장이 없습니다. 매장을 먼저 등록해 주세요." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...shop,
        latitude: Number(shop.latitude),
        longitude: Number(shop.longitude),
      },
    });
  } catch (error) {
    console.error("🚨 내 매장 정보 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
