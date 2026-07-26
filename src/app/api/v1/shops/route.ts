import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 🏬 소비자 앱에서 둘러볼 수 있는 매장 목록 공개 조회 (GET, 로그인 불필요)
 */
export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        shopId: true,
        shopName: true,
        baseAddress: true,
        latitude: true,
        longitude: true,
        rootPrice: true,
        fullPrice: true,
      },
    });

    // Prisma Decimal(latitude/longitude)을 클라이언트가 바로 쓸 수 있는 number로 변환
    const formatted = shops.map((shop) => ({
      ...shop,
      latitude: Number(shop.latitude),
      longitude: Number(shop.longitude),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("🚨 매장 목록 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/**
 * 🆕 오너 회원가입 이후 최초 매장 등록 (POST, 로그인 필요)
 */
export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다.",
        },
        { status: 401 },
      );
    }

    if (user.role !== "SHOP_OWNER") {
      return NextResponse.json(
        { success: false, error: "매장 등록은 오너 계정만 가능합니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      shopName,
      baseAddress,
      latitude,
      longitude,
      businessNumber,
      rootPrice,
      fullPrice,
    } = body;

    if (
      !shopName ||
      !baseAddress ||
      latitude === undefined ||
      longitude === undefined ||
      !businessNumber
    ) {
      return NextResponse.json(
        { success: false, error: "모든 필수 항목을 입력해 주세요." },
        { status: 400 },
      );
    }

    // 오너 1인당 매장 1개 정책: 이미 매장을 등록한 오너인지 확인
    const existingShop = await prisma.shop.findFirst({
      where: { ownerId: user.userId },
      select: { shopId: true },
    });

    if (existingShop) {
      return NextResponse.json(
        { success: false, error: "이미 등록된 매장이 있습니다." },
        { status: 409 },
      );
    }

    const newShop = await prisma.shop.create({
      data: {
        ownerId: user.userId,
        shopName,
        baseAddress,
        latitude,
        longitude,
        businessNumber,
        rootPrice: rootPrice ?? 0,
        fullPrice: fullPrice ?? 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "매장이 성공적으로 등록되었습니다.",
        data: {
          ...newShop,
          latitude: Number(newShop.latitude),
          longitude: Number(newShop.longitude),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "이미 사용 중인 사업자 등록번호입니다." },
        { status: 409 },
      );
    }

    console.error("🚨 매장 등록 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
