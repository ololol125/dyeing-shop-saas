import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { verifyAuth } from "@/lib/auth"; // ⭕ 실제 존재하는 함수로 교정

export async function GET(request: Request) {
  try {
    // 1. 이미 구현된 verifyAuth 함수에 request를 통째로 넘겨 유저 정보 추출
    const user = verifyAuth(request);

    // 토큰이 없거나 유효하지 않은 경우 401 Unauthorized 반환
    if (!user || !user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "인증 정보가 올바르지 않습니다. 로그인이 필요합니다.",
        },
        { status: 401 },
      );
    }

    // 2. 인증된 유저의 userId를 사용하여 매장(Shop) 정보 조회
    const userShop = await prisma.shop.findFirst({
      where: { ownerId: user.userId },
      select: { shopId: true },
    });

    if (!userShop) {
      return NextResponse.json(
        { success: false, error: "해당 오너 계정에 등록된 매장이 없습니다." },
        { status: 404 },
      );
    }

    const shopId = userShop.shopId;

    // --- [날짜 기준 계산 구역] ---
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // --- [Prisma 병렬 쿼리 실행 구역] ---
    const [
      thisMonthReservations,
      todayReservations,
      recentReservations,
      designersWithReservations,
    ] = await prisma.$transaction([
      // 쿼리 A: 이번 달 총 예약 내역 (매출, 고객 수 산출용)
      prisma.reservation.findMany({
        where: {
          shopId: shopId,
          reservationTime: { gte: monthStart, lte: monthEnd },
          status: { not: "CANCELLED" },
        },
        select: { totalAmount: true, clientId: true },
      }),

      // 쿼리 B: 오늘 예약 내역 현황 상태 분기용
      prisma.reservation.findMany({
        where: {
          shopId: shopId,
          reservationTime: { gte: todayStart, lte: todayEnd },
        },
        select: { status: true },
      }),

      // 쿼리 C: 상단에 띄워줄 최근 예약 리스트 (5건)
      prisma.reservation.findMany({
        where: { shopId: shopId },
        orderBy: { reservationTime: "desc" },
        take: 5,
        include: {
          client: { select: { name: true } },
          designers: {
            include: {
              designer: { select: { designerName: true, position: true } },
            },
          },
        },
      }),

      // 쿼리 D: 이번 달 디자이너 실적 정렬용
      prisma.designer.findMany({
        where: { shopId: shopId, isActive: true },
        select: {
          designerName: true,
          position: true,
          reservations: {
            where: {
              reservation: {
                reservationTime: { gte: monthStart, lte: monthEnd },
                status: "CONFIRMED",
              },
            },
            include: { reservation: { select: { totalAmount: true } } },
          },
        },
      }),
    ]);

    // --- [데이터 비즈니스 로직 가공 구역] ---
    const totalRevenue = thisMonthReservations.reduce(
      (sum, res) => sum + res.totalAmount,
      0,
    );
    const uniqueClients = new Set(
      thisMonthReservations.map((res) => res.clientId).filter(Boolean),
    );
    const activeCustomers = uniqueClients.size;

    const todayReservationsCount = todayReservations.filter(
      (res) => res.status === "CONFIRMED",
    ).length;
    const pendingReservationsCount = todayReservations.filter(
      (res) => res.status === "PENDING",
    ).length;

    const formattedReservations = recentReservations.map((res) => {
      const primaryDesigner = res.designers[0]?.designer;
      const designerStr = primaryDesigner
        ? `${primaryDesigner.designerName} ${primaryDesigner.position}`
        : "미지정";
      return {
        id: res.reservationId.toString(),
        customerName: res.client?.name || "익명 회원",
        designerName: designerStr,
        treatment: res.menuType,
        time: res.reservationTime.toISOString().substring(11, 16),
        status: res.status,
      };
    });

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
      .sort((a, b) => b.revenue - a.revenue)
      .map((item, idx) => ({
        name: item.name,
        rank: idx + 1,
        reservations: item.reservations,
        revenue: item.revenueStr,
      }))
      .slice(0, 3);

    // 3. 최종 성공 결과 반환
    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        revenueGrowth: 12.5,
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
