import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // 공통 헬퍼 함수 임포트

// 1. 📅 매장별 예약 목록 조회 (GET)
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

    // 🎯 예약 목록을 가져올 때 배정된 디자이너 정보까지 묶어서(include) 최신순으로 가져옵니다.
    const reservations = await prisma.reservation.findMany({
      where: { shopId: shop.shopId },
      include: {
        client: true, // 예약한 고객 정보 조인
        designers: {
          // 🟢 영현님 스키마 필드명에 맞게 designers로 매핑!
          include: {
            designer: true, // 중간 테이블을 거쳐 실제 디자이너 이름/직급까지 조인
          },
        },
      },
      orderBy: { reservationTime: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        reservations,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("🚨 예약 목록 조회 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 2. ➕ 신규 예약 등록 (POST)
export async function POST(request: Request) {
  try {
    const decoded = verifyAuth(request);
    if (!decoded || decoded.role !== "SHOP_OWNER") {
      return NextResponse.json(
        { success: false, error: "원장님 계정만 접근 가능합니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { clientId, reservationTime, menuType, totalAmount, designerIds } =
      body;

    // 필수 항목 및 유효성 검증
    if (
      !clientId ||
      !reservationTime ||
      !menuType ||
      totalAmount === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "필수 입력 항목이 누락되었습니다." },
        { status: 400 },
      );
    }

    if (menuType !== "ROOT_DYE" && menuType !== "FULL_DYE") {
      return NextResponse.json(
        {
          success: false,
          error: "메뉴 타입은 'ROOT_DYE' 또는 'FULL_DYE'만 가능합니다.",
        },
        { status: 400 },
      );
    }

    // 원장님의 매장 ID 조회
    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "매장 정보가 존재하지 않습니다." },
        { status: 404 },
      );
    }

    // 🎯 [Prisma 연전 인서트] 예약 생성과 동시에 assigned_to 중간 테이블 매핑 데이터를 한 방에 저장!
    const newReservation = await prisma.reservation.create({
      data: {
        shopId: shop.shopId,
        clientId: Number(clientId),
        reservationTime: new Date(reservationTime),
        menuType,
        totalAmount: Number(totalAmount),
        status: "CONFIRMED",
        // 🟢 designers 관계 필드를 이용해 배정된 디자이너 ID들을 중간 테이블 레코드로 create 시킵니다.
        designers:
          designerIds && designerIds.length > 0
            ? {
                create: designerIds.map((id: number) => ({
                  designerId: Number(id),
                })),
              }
            : undefined,
      },
      // 응답 결과에 저장된 디자이너 내역도 함께 포함시킵니다.
      include: {
        designers: {
          include: {
            designer: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "디자이너가 지정된 예약이 성공적으로 등록되었습니다.",
        reservation: newReservation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🚨 예약 등록 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
