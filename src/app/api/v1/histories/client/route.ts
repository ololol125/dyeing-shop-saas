import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "인증 정보가 유효하지 않습니다." },
        { status: 401 },
      );
    }

    // URL 쿼리 스트링에서 clientId 파라미터 추출
    const { searchParams } = new URL(request.url);
    const clientIdStr = searchParams.get("clientId");

    if (!clientIdStr) {
      return NextResponse.json(
        { success: false, error: "고객 식별자(clientId)가 누락되었습니다." },
        { status: 400 },
      );
    }

    const clientId = parseInt(clientIdStr, 10);

    // 로그인한 원장님의 매장 정보 조회
    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 🎯 SQL 관점: hair_history를 기준으로 AppUser(고객 정보)와 Reservation(금액, 시술메뉴)을 복합 조인
    const clientHistories = await prisma.hairHistory.findMany({
      where: {
        shopId: shop.shopId,
        clientId: clientId,
      },
      include: {
        client: {
          select: { name: true, phone: true, email: true },
        },
        reservation: {
          select: { menuType: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" }, // 가장 최신 시술 기록이 타임라인 맨 위로 오도록 정렬
    });

    // 만약 시술 기록은 없지만 고객 정보는 존재하는 경우를 위한 방어 로직
    let clientProfile = clientHistories[0]?.client;
    if (!clientProfile) {
      clientProfile = await prisma.appUser.findUnique({
        where: { userId: clientId },
        select: { name: true, phone: true, email: true },
      });
    }

    // 프론트엔드가 타임라인 컴포넌트를 부드럽게 렌더링할 수 있도록 규격화
    const formattedData = clientHistories.map((hist) => ({
      historyId: hist.historyId,
      treatmentDate: hist.createdAt
        ? hist.createdAt.toISOString()
        : new Date().toISOString(),
      treatmentNote: hist.treatmentNote || "기록된 메모가 없습니다.",
      menuType: hist.reservation?.menuType || "일반 시술",
      totalAmount: hist.reservation?.totalAmount || 0,
    }));

    return NextResponse.json({
      success: true,
      client: clientProfile,
      data: formattedData,
    });
  } catch (error) {
    console.error("🚨 고객별 히스토리 차트 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
