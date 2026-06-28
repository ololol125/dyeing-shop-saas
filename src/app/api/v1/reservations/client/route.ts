import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // 🟢 기존 verifyAuth 함수 임포트

// 1. 소비자가 자신의 예약 내역 목록 조회 (GET)
export async function GET(req: NextRequest) {
  try {
    // 🟢 제공해주신 verifyAuth 함수를 사용하여 토큰 검증 및 유저 정보 추출
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "인증 토큰이 누락되었거나 유효하지 않습니다.",
        },
        { status: 401 },
      );
    }

    // 소비자의 ID(userId)로 필터링하여 예약 목록 조회 (매장 정보 포함)
    const reservations = await prisma.reservation.findMany({
      where: {
        clientId: decoded.userId,
      },
      include: {
        shop: {
          select: {
            shopName: true,
            baseAddress: true,
          },
        },
        designers: {
          include: {
            designer: {
              select: {
                designerName: true,
                position: true,
              },
            },
          },
        },
      },
      orderBy: {
        reservationTime: "desc",
      },
    });

    return NextResponse.json(
      { success: true, data: reservations },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("🚨 소비자 예약 조회 에러:", error);
    return NextResponse.json(
      { success: false, error: "예약 내역을 가져오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 2. 소비자의 새로운 미용실 예약 신청 (POST)
export async function POST(req: NextRequest) {
  try {
    // 🟢 제공해주신 verifyAuth 함수를 사용하여 토큰 검증
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "인증 토큰이 누락되었거나 유효하지 않습니다.",
        },
        { status: 401 },
      );
    }

    // FlutterFlow에서 보낸 Body 데이터 파싱
    const body = await req.json();
    const {
      shopId,
      designerId,
      reservationTime,
      menuType,
      totalAmount,
      notes,
    } = body;

    // 필수 예약을 위한 유효성 검사 (totalAmount 포함)
    if (
      !shopId ||
      !designerId ||
      !reservationTime ||
      !menuType ||
      totalAmount === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "필수 예약 정보(매장, 디자이너, 시간, 메뉴, 결제금액)가 누락되었습니다.",
        },
        { status: 400 },
      );
    }

    // Prisma 트랜잭션을 사용하여 예약(Reservation)과 디자이너 매핑(AssignedTo)을 동시 생성
    const newReservation = await prisma.$transaction(async (tx) => {
      // 1. 예약 데이터 생성 (Prisma 스키마의 실제 매핑 필드명 준수 및 새 notes 필드 반영)
      const reservation = await tx.reservation.create({
        data: {
          shopId: Number(shopId),
          clientId: decoded.userId,
          reservationTime: new Date(reservationTime),
          menuType,
          totalAmount: Number(totalAmount),
          status: "CONFIRMED", // 🟢 기본 스키마의 default 값이 CONFIRMED이므로 일치시킴
          notes: notes || null, // 🟢 스키마에 새로 추가한 notes 필드 매핑
        },
      });

      // 2. 해당 예약에 디자이너 배정 (AssignedTo 다대다 매핑 테이블 관계 설정)
      await tx.assignedTo.create({
        data: {
          reservationId: reservation.reservationId,
          designerId: Number(designerId),
        },
      });

      return reservation;
    });

    return NextResponse.json(
      {
        success: true,
        message: "예약이 성공적으로 접수되었습니다.",
        data: newReservation,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("🚨 소비자 예약 생성 에러:", error);
    return NextResponse.json(
      { success: false, error: "예약 처리 중 서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
