import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dyeing-shop-saas-secret-key-1234";

// 헬퍼 함수: 요청 헤더에서 JWT 토큰을 검증하고 유저 정보를 반환
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}

// 1. 👥 디자이너 목록 조회 (GET)
export async function GET(request: Request) {
  try {
    // [인증 체크] 로그인한 유저인지 확인
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "인증 유효하지 않거나 토큰이 누락되었습니다.",
        },
        { status: 401 },
      );
    }

    // 원장님의 유저 ID를 기반으로 소유한 매장(Shop)을 먼저 찾습니다.
    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 매장에 소속된 디자이너 목록을 DB에서 조회합니다.
    const designers = await prisma.designer.findMany({
      where: { shopId: shop.shopId },
      orderBy: { designerId: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        designers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("🚨 디자이너 조회 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// 2. ➕ 디자이너 신규 등록 (POST)
export async function POST(request: Request) {
  try {
    // [인증 체크]
    const decoded = verifyAuth(request);
    if (!decoded || decoded.role !== "SHOP_OWNER") {
      return NextResponse.json(
        { success: false, error: "원장님 계정만 접근 가능합니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { designerName, position } = body;

    if (!designerName || !position) {
      return NextResponse.json(
        { success: false, error: "디자이너 이름과 직급을 입력해 주세요." },
        { status: 400 },
      );
    }

    // 원장님의 매장 ID 조회
    const shop = await prisma.shop.findFirst({
      where: { ownerId: decoded.userId },
    });

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error:
            "디자이너를 등록할 매장이 존재하지 않습니다. 먼저 매장을 생성해 주세요.",
        },
        { status: 404 },
      );
    }

    // 🎯 Supabase designer 테이블에 저장
    const newDesigner = await prisma.designer.create({
      data: {
        shopId: shop.shopId,
        designerName,
        position,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "디자이너가 성공적으로 등록되었습니다.",
        designer: newDesigner,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🚨 디자이너 등록 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
