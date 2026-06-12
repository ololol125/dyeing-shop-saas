import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // 🟢 우리가 만든 무적의 공통 헬퍼 임포트!

// 1. 📅 매장별 예약 목록 조회 (GET)
// 로그인한 원장님 매장의 모든 예약 내역을 날짜순으로 정렬해서 가져옵니다.
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

    // 🎯 해당 매장의 예약 목록을 예약 시간순(오름차순)으로 조회
    const reservations = await prisma.reservation.findMany({
      where: { shopId: shop.shopId },
      include: {
        client: true, // 어떤 손님이 예약했는지 유저 정보 조인
      },
      orderBy: { reservationTime: "asc" }, // 곧 다가올 예약이 맨 위로 오도록 정렬
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
    // 영현님의 DB 실제 컬럼명(clientId, reservationTime, menuType, totalAmount)에 맞게 파싱
    const { clientId, reservationTime, menuType, totalAmount } = body;

    // 필수 항목 및 유효성 검증
    if (
      !clientId ||
      !reservationTime ||
      !menuType ||
      totalAmount === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "필수 입력 항목(손님ID, 예약시간, 메뉴타입, 금액)이 누락되었습니다.",
        },
        { status: 400 },
      );
    }

    // DB의 CHECK 제약조건 ('ROOT_DYE', 'FULL_DYE') 위반 방지 검증
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

    // 🎯 실제 reservation 테이블 규격에 맞게 저장
    const newReservation = await prisma.reservation.create({
      data: {
        shopId: shop.shopId,
        clientId: Number(clientId),
        reservationTime: new Date(reservationTime), // 문자열로 들어온 시간을 Date 객체로 변환
        menuType,
        totalAmount: Number(totalAmount),
        status: "CONFIRMED", // 기본값 설정
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
