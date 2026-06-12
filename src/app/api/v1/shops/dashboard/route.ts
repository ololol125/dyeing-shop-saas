import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 프로젝트의 prisma 인스턴스 경로에 맞게 확인해주세요.
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    // 1. URL 쿼리 스트링에서 shopId 추출 (실제 운영 환경에선 세션/토큰의 user_id 기반으로 shop을 조회해도 좋습니다)
    const { searchParams } = new URL(request.url);
    const shopIdStr = searchParams.get("shopId");

    if (!shopIdStr) {
      return NextResponse.json(
        { success: false, error: "shopId가 필요합니다." },
        { status: 400 },
      );
    }

    const shopId = parseInt(shopIdStr, 10);
    if (isNaN(shopId)) {
      return NextResponse.json(
        { success: false, error: "올바른 shopId 형식이 아닙니다." },
        { status: 400 },
      );
    }

    // 날짜 기준 계산을 위한 시간 정의
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // 2. 대시보드에 필요한 핵심 데이터들을 병렬 쿼리로 조회 (성능 최적화)
    const [
      thisMonthReservations, // 이번달 매출 및 고객 수 집계용
      todayReservations, // 오늘의 예약
      recentReservations, // 최근 예약 현황 리스트 (최신 5건)
      designersWithReservations, // 디자이너별 실적용
    ] = await prisma.$transaction([
      // 쿼리 A: 이번 달 매장의 모든 정상 예약 조회 (매출, 고객 수 계산용)
      prisma.reservation.findMany({
        where: {
          shopId: shopId,
          reservationTime: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: { not: "CANCELLED" }, // 취소된 예약 제외
        },
        select: {
          totalAmount: true,
          clientId: true,
        },
      }),

      // 쿼리 B: 오늘 매장의 예약 현황 통계
      prisma.reservation.findMany({
        where: {
          shopId: shopId,
          reservationTime: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        select: {
          status: true,
        },
      }),

      // 쿼리 C: 대시보드 테이블에 뿌려줄 최근 예약 리스트 (사용자 정보 및 담당 디자이너 포함)
      prisma.reservation.findMany({
        where: { shopId: shopId },
        orderBy: { reservationTime: "desc" },
        take: 5,
        include: {
          client: {
            select: { name: true },
          },
          designers: {
            include: {
              designer: {
                select: { designerName: true, position: true },
              },
            },
          },
        },
      }),

      // 쿼리 D: 이번 달 디자이너 실적 산출을 위한 데이터
      prisma.designer.findMany({
        where: { shopId: shopId, isActive: true },
        select: {
          designerName: true,
          position: true,
          reservations: {
            where: {
              reservation: {
                reservationTime: { gte: monthStart, lte: monthEnd },
                status: "CONFIRMED", // 확정/완료된 건만 실적 집계
              },
            },
            include: {
              reservation: {
                select: { totalAmount: true },
              },
            },
          },
        },
      }),
    ]);

    // 3. 비즈니스 로직 가공 및 집계

    // 3-1. 이번달 총 매출 및 고유 방문 고객 수 계산
    const totalRevenue = thisMonthReservations.reduce(
      (sum, res) => sum + res.totalAmount,
      0,
    );
    const uniqueClients = new Set(
      thisMonthReservations.map((res) => res.clientId).filter(Boolean),
    );
    const activeCustomers = uniqueClients.size;

    // 3-2. 오늘 예약 상태별 분기
    const todayReservationsCount = todayReservations.filter(
      (res) => res.status === "CONFIRMED",
    ).length;
    const pendingReservationsCount = todayReservations.filter(
      (res) => res.status === "PENDING",
    ).length;

    // 3-3. 최근 예약 데이터 프론트엔드 포맷팅
    const formattedReservations = recentReservations.map((res) => {
      // 다대다(AssignedTo) 관계에서 첫 번째 담당 디자이너 이름을 추출
      const primaryDesigner = res.designers[0]?.designer;
      const designerStr = primaryDesigner
        ? `${primaryDesigner.designerName} ${primaryDesigner.position}`
        : "미지정";

      return {
        id: res.reservationId.toString(),
        customerName: res.client?.name || "익명 회원",
        designerName: designerStr,
        treatment: res.menuType,
        time: res.reservationTime.toISOString().substring(11, 16), // "HH:MM" 포맷팅
        status: res.status,
      };
    });

    // 3-4. 이달의 우수 디자이너 순위 가공
    const topDesigners = designersWithReservations
      .map((d) => {
        const resCount = d.reservations.length;
        const revenueSum = d.reservations.reduce(
          (sum, item) => sum + (item.reservation?.totalAmount || 0),
          0,
        );
        return {
          name: `${d.designerName} ${d.position}`,
          reservations: resCount,
          revenue: revenueSum,
          revenueStr: `${revenueSum.toLocaleString()}원`,
        };
      })
      // 매출액이 높은 순서로 정렬
      .sort((a, b) => b.revenue - a.revenue)
      .map((item, idx) => ({
        name: item.name,
        rank: idx + 1,
        reservations: item.reservations,
        revenue: item.revenueStr,
      }))
      .slice(0, 3); // 상위 3명만 노출

    // 4. 조립된 예쁜 데이터 반환
    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        revenueGrowth: 12.5, // 전월 대비 성장률 데이터 등은 히스토리 테이블 연동 후 동적 연산 가능 (우선 고정 mock 배치)
        activeCustomers,
        customerGrowth: 8.2,
        todayReservations: todayReservationsCount,
        pendingReservations: pendingReservationsCount,
      },
      recentReservations: formattedReservations,
      topDesigners: topDesigners,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
