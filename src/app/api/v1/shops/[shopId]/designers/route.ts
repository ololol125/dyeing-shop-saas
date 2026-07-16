import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * 🧑‍🎨 소비자가 예약 시 고를 수 있는 특정 매장의 활성 디자이너 목록 공개 조회 (GET, 로그인 불필요)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  try {
    const { shopId } = await params;
    const shopIdNum = parseInt(shopId, 10);

    if (Number.isNaN(shopIdNum)) {
      return NextResponse.json(
        { success: false, error: "올바르지 않은 매장 ID입니다." },
        { status: 400 },
      );
    }

    const designers = await prisma.designer.findMany({
      where: { shopId: shopIdNum, isActive: true },
      select: { designerId: true, designerName: true, position: true },
      orderBy: { designerId: "asc" },
    });

    return NextResponse.json({ success: true, data: designers });
  } catch (error) {
    console.error("🚨 매장별 디자이너 목록 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
