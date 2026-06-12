// src/app/api/v1/reservations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { startOfMonth, endOfMonth } from "date-fns";

// 1. 📅 매장별 이번 달 예약 목록 조회 (GET)
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

    // 원장님의 매장 조회
    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // 🎯 영현님 스키마 맞춤 조회: client 필드(AppUser 모델)를 조인합니다.
    const reservations = await prisma.reservation.findMany({
      where: {
        shopId: shop.shopId,
        reservationTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        client: true, // ⭕ AppUser 테이블 조인 (스키마의 client 관계 필드 사용)
        designers: {
          include: {
            designer: true,
          },
        },
      },
      orderBy: { reservationTime: "asc" },
    });

    // 프론트엔드 UI 컴포넌트 변수명(customerName, customerPhone)에 맞게 안전하게 포매팅
    const formattedData = reservations.map((res) => {
      const primaryDesigner = res.designers[0]?.designer;
      return {
        reservationId: res.reservationId,
        customerName: res.client?.name || "익명 회원", // client(AppUser)의 name 추출
        customerPhone: res.client?.phone || "전화번호 없음", // client(AppUser)의 phone 추출
        treatment: res.menuType,
        totalAmount: res.totalAmount,
        reservationTime: res.reservationTime.toISOString(),
        status: res.status,
        designerName: primaryDesigner
          ? `${primaryDesigner.designerName} ${primaryDesigner.position}`
          : "미지정",
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
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

    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "매장 정보가 존재하지 않습니다." },
        { status: 404 },
      );
    }

    const newReservation = await prisma.reservation.create({
      data: {
        shopId: shop.shopId,
        clientId: Number(clientId), // ⭕ schema.prisma의 client_id 맵핑 필드에 매칭
        reservationTime: new Date(reservationTime),
        menuType,
        totalAmount: Number(totalAmount),
        status: "PENDING",
        designers:
          designerIds && designerIds.length > 0
            ? {
                create: designerIds.map((id: number) => ({
                  designerId: Number(id),
                })),
              }
            : undefined,
      },
      include: {
        designers: {
          include: { designer: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "예약이 성공적으로 등록되었습니다.",
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

// 3. 🔄 예약 상태 업데이트 (PATCH)
export async function PATCH(request: Request) {
  try {
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "인증 권한이 없습니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { reservationId, status } = body;

    if (!reservationId || !status) {
      return NextResponse.json(
        { success: false, error: "필수 요청 데이터가 누락되었습니다." },
        { status: 400 },
      );
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "매장 권한을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const updated = await prisma.reservation.updateMany({
      where: {
        reservationId: parseInt(reservationId, 10),
        shopId: shop.shopId,
      },
      data: { status },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "상태를 변경할 예약이 없거나 권한이 없습니다.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "예약 상태가 정상적으로 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("🚨 예약 상태 변경 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
