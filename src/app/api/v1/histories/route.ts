import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // 🟢 공통 헬퍼 함수 임포트!

// 1. 📜 전체 시술 히스토리 목록 조회 (GET)
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

    // 조회 결과 반환...
    const histories = await prisma.hairHistory.findMany({
      where: { shopId: shop.shopId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, histories }, { status: 200 });
  } catch (error) {
    console.error("🚨 조회 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류" },
      { status: 500 },
    );
  }
}

// 2. 📝 신규 시술 히스토리 작성 (POST) ➔ 🟢 새로 추가된 엔진!
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
    // 영현님의 수퍼베이스 DB 실제 컬럼명(reservationId, clientId, treatmentNote)에 매핑
    const { reservationId, clientId, treatmentNote } = body;

    // 필수값 검증 (최소한 미용실에 방문한 손님 ID는 알아야 기록을 남깁니다)
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "손님(Client) ID는 필수 항목입니다." },
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

    // 🎯 실제 hair_history 테이블 규격에 맞게 인서트
    const newHistory = await prisma.hairHistory.create({
      data: {
        shopId: shop.shopId,
        clientId: Number(clientId),
        reservationId: reservationId ? Number(reservationId) : null,
        treatmentNote: treatmentNote || "", // 시술 약제 및 노트 메모 내용
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "시술 히스토리가 성공적으로 기록되었습니다.",
        history: newHistory,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🚨 시술 히스토리 등록 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
