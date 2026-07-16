import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * 🏬 소비자 앱에서 둘러볼 수 있는 매장 목록 공개 조회 (GET, 로그인 불필요)
 */
export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        shopId: true,
        shopName: true,
        baseAddress: true,
        latitude: true,
        longitude: true,
        rootPrice: true,
        fullPrice: true,
      },
    });

    // Prisma Decimal(latitude/longitude)을 클라이언트가 바로 쓸 수 있는 number로 변환
    const formatted = shops.map((shop) => ({
      ...shop,
      latitude: Number(shop.latitude),
      longitude: Number(shop.longitude),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("🚨 매장 목록 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
