import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { startOfMonth, endOfMonth } from "date-fns";

// 1. 📅 매장별 이번 달 예약 목록 조회 (GET) - 디자이너 다중 배지 레이어 데이터 추가
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

    const reservations = await prisma.reservation.findMany({
      where: {
        shopId: shop.shopId,
        reservationTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        client: true, // AppUser 테이블 조인
        designers: {
          include: {
            designer: true,
          },
        },
      },
      orderBy: { reservationTime: "asc" },
    });

    // 프론트엔드 UI 컴포넌트 변수명 및 디자이너 배지 시스템 레이어 스펙에 맞게 가공
    const formattedData = reservations.map((res) => {
      const primaryDesigner = res.designers[0]?.designer;

      // 🎯 [추가] 배정된 모든 디자이너 목록을 배열 형태로 정제 (프론트엔드 배지 맵핑용)
      const assignedDesigners = res.designers.map((d) => ({
        designerId: d.designer.designerId,
        designerName: d.designer.designerName,
        position: d.designer.position,
      }));

      return {
        reservationId: res.reservationId,
        clientId: res.clientId,
        customerName: res.client?.name || "미지정 고객",
        customerPhone: res.client?.phone || "010-0000-0000",
        treatment: res.menuType,
        totalAmount: res.totalAmount,
        reservationTime: res.reservationTime.toISOString(),
        status: res.status,
        // 기존 텍스트 포맷 유지 (하위 호환성 확보)
        designerName: primaryDesigner
          ? `${primaryDesigner.designerName} (${primaryDesigner.position})`
          : "담당자 미정",
        // 🎯 [추가] 고도화된 디자이너 관리 레이어 전용 배열 데이터 전달
        designers: assignedDesigners,
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

// 2. ➕ 신규 예약 등록 (POST) - 기존 안정화 로직 유지
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
        clientId: Number(clientId),
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

// 3. 🔄 예약 상태 및 디자이너 배정 업데이트 (PATCH) - 재배정 레이어 연동 확장
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
    const { reservationId, status, designerIds } = body; // 🎯 designerIds 추가 허용

    if (!reservationId) {
      return NextResponse.json(
        {
          success: false,
          error: "필수 요청 데이터(reservationId)가 누락되었습니다.",
        },
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

    const targetReservationId = parseInt(reservationId, 10);

    // 🎯 디자이너 정보도 함께 변경 요청이 들어온 경우 트랜잭션 처리
    await prisma.$transaction(async (tx) => {
      // 1) 예약 상태나 기본 필드 업데이트 데이터 구성
      const updateData: any = {};
      if (status) updateData.status = status;

      // 2) 디자이너 리스트가 넘어왔을 경우 관계 재설정 (기존 맵핑 초기화 후 새로 인서트)
      if (designerIds && Array.isArray(designerIds)) {
        // 우선 기존 해당 예약의 디자이너 매핑 관계 전부 삭제 (AssignedTo 테이블 기준)
        // ※ 스키마 명칭에 맞춰 reservationId 기준으로 제거합니다.
        await tx.assignedTo.deleteMany({
          where: { reservationId: targetReservationId },
        });

        // 새로운 디자이너 연결 관계 주입
        if (designerIds.length > 0) {
          updateData.designers = {
            create: designerIds.map((id: number) => ({
              designerId: Number(id),
            })),
          };
        }
      }

      // 3) 예약 메인 레코드 최종 업데이트 실행
      await tx.reservation.update({
        where: {
          reservationId: targetReservationId,
          shopId: shop.shopId, // 타인 매장 예약 수정 방어
        },
        data: updateData,
      });
    });

    return NextResponse.json({
      success: true,
      message:
        "예약 상태 및 디자이너 배정 정보가 정상적으로 업데이트되었습니다.",
    });
  } catch (error: any) {
    console.error("🚨 예약 상태 및 담당자 재배정 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "서버 내부 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
