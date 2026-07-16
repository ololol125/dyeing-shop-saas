import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 1. 소비자가 자신의 예약 내역 목록 조회 (GET)
export async function GET(req: NextRequest) {
  try {
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

    // 🟢 schema.prisma 규칙 반영: 카멜 케이스 필드명 사용
    const reservations = await prisma.reservation.findMany({
      where: {
        clientId: decoded.userId, // 스키마의 clientId와 매핑
      },
      include: {
        shop: {
          select: {
            shopName: true, // 스키마의 shopName과 매핑
            baseAddress: true, // 스키마의 baseAddress와 매핑
          },
        },
        designers: {
          // 스키마의 designers 관계 필드와 정확히 일치
          include: {
            designer: {
              select: {
                designerName: true, // 스키마의 designerName과 매핑
                position: true,
              },
            },
          },
        },
      },
      orderBy: {
        reservationTime: "desc", // 스키마의 reservationTime과 매핑
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

    const body = await req.json();
    const {
      shopId,
      designerId,
      reservationTime,
      menuType,
      totalAmount,
      notes,
    } = body;

    if (
      !shopId ||
      !designerId ||
      !reservationTime ||
      !menuType ||
      totalAmount === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "필수 예약 정보가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 🟢 schema.prisma 규칙 반영: assignedTo 및 카멜 케이스 인스턴스 사용
    const newReservation = await prisma.$transaction(async (tx) => {
      // 1. 예약 데이터 생성
      const reservation = await tx.reservation.create({
        data: {
          shopId: Number(shopId),
          clientId: decoded.userId,
          reservationTime: new Date(reservationTime),
          menuType,
          totalAmount: Number(totalAmount),
          status: "CONFIRMED",
          notes: notes || null,
        },
      });

      // 2. 해당 예약에 디자이너 배정 (AssignedTo 모델 연결 테이블 명세)
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
