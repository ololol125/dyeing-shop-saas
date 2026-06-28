import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // 🟢 공통 헬퍼 함수 임포트!

// 1. 📜 시술 히스토리 목록 조회 (GET) - 전체 조회 및 특정 고객 필터링 기능 통합 보완
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

    // 🔍 URL 쿼리 스트링 파싱 (?clientId=숫자 형태 대응)
    const { searchParams } = new URL(request.url);
    const clientIdStr = searchParams.get("clientId");

    // WHERE 조건절 동적 구성
    const whereCondition: any = { shopId: shop.shopId };

    if (clientIdStr) {
      whereCondition.clientId = parseInt(clientIdStr, 10);
    }

    // SQL 관점: hair_history 기반 조회 + 예약(menuType, 금액) 및 고객(이름, 번호) 정보 관계 조인
    const histories = await prisma.hairHistory.findMany({
      where: whereCondition,
      include: {
        client: {
          select: { name: true, phone: true, email: true },
        },
        reservation: {
          select: { menuType: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" }, // 최신 시술 기록이 맨 위로 오도록 정렬
    });

    // 프론트엔드가 다루기 편한 데이터 구조로 가공
    const formattedHistories = histories.map((hist) => ({
      historyId: hist.historyId,
      clientId: hist.clientId,
      customerName: hist.client?.name || "익명 회원",
      customerPhone: hist.client?.phone || "연락처 없음",
      treatmentDate: hist.createdAt
        ? hist.createdAt.toISOString()
        : new Date().toISOString(),
      treatmentNote: hist.treatmentNote || "",
      menuType: hist.reservation?.menuType || "기타 시술",
      totalAmount: hist.reservation?.totalAmount || 0,
    }));

    return NextResponse.json(
      { success: true, data: formattedHistories },
      { status: 200 },
    );
  } catch (error) {
    console.error("🚨 조회 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 2. 📝 신규 시술 히스토리 작성 및 예약 완료 상태 전환 (POST)
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

    // 디버깅 콘솔: 전달받은 파라미터 상태를 서버 터미널에서 즉시 확인 가능하도록 지원
    console.log("📥 백엔드 수신 데이터 바디:", body);

    const { reservationId, clientId, treatmentNote } = body;

    // 1. 필수값 방어 코드 보완 (인자값이 제대로 파싱되었는지 더 꼼꼼히 체크)
    if (clientId === undefined || clientId === null || !reservationId) {
      return NextResponse.json(
        {
          success: false,
          error: `손님(Client) ID와 예약(Reservation) ID는 필수 항목입니다. (전송된 값 -> clientId: ${clientId}, reservationId: ${reservationId})`,
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

    // 2. 🎯 데이터 정합성을 위한 Prisma 트랜잭션 가동
    const [newHistory] = await prisma.$transaction([
      // A. hair_history 테이블 규격 인서트
      prisma.hairHistory.create({
        data: {
          shopId: shop.shopId,
          clientId: Number(clientId),
          reservationId: Number(reservationId),
          treatmentNote: treatmentNote || "",
        },
      }),
      // B. reservation 테이블 상태 업데이트 (신규 DDL 제약조건 'COMPLETED' 완벽 매칭)
      prisma.reservation.update({
        where: { reservationId: Number(reservationId) },
        data: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "시술 완료 처리 및 히스토리가 성공적으로 기록되었습니다.",
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
