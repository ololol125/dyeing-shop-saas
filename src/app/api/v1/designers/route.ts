import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { verifyAuth } from "@/lib/auth"; // 이미 만들어진 토큰 검증 유틸 사용

/**
 * 🔍 1. 해당 오너 매장의 디자이너 목록 조회 (GET)
 */
export async function GET(request: Request) {
  try {
    // 토큰 인증 검사 수행
    const user = verifyAuth(request); //
    if (!user || !user.userId) {
      //
      return NextResponse.json(
        {
          success: false,
          error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다.",
        },
        { status: 401 },
      );
    }

    // 현재 로그인한 오너가 관리하는 매장(Shop) 정보 조회
    const userShop = await prisma.shop.findFirst({
      //
      where: { ownerId: user.userId }, //
      select: { shopId: true },
    });

    if (!userShop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 매장에 소속된 디자이너 리스트 전체 가져오기
    const designers = await prisma.designer.findMany({
      //
      where: { shopId: userShop.shopId }, //
      orderBy: { createdAt: "desc" }, // 최신 등록 순 정렬
    });

    return NextResponse.json({
      success: true,
      data: designers,
    });
  } catch (error) {
    console.error("🚨 디자이너 목록 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/**
 * ➕ 2. 신규 디자이너 등록 (POST)
 */
export async function POST(request: Request) {
  try {
    // 토큰 인증 검사 수행
    const user = verifyAuth(request); //
    if (!user || !user.userId) {
      //
      return NextResponse.json(
        {
          success: false,
          error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다.",
        },
        { status: 401 },
      );
    }

    // 클라이언트가 보낸 데이터 Body 파싱
    const body = await request.json();
    const { designerName, position } = body;

    // 유효성 검사
    if (!designerName || !position) {
      return NextResponse.json(
        { success: false, error: "디자이너 이름과 직급을 입력해 주세요." },
        { status: 400 },
      );
    }

    // 현재 로그인한 오너의 매장(Shop) ID 조회
    const userShop = await prisma.shop.findFirst({
      //
      where: { ownerId: user.userId }, //
      select: { shopId: true },
    });

    if (!userShop) {
      return NextResponse.json(
        {
          success: false,
          error: "디자이너를 등록할 매장이 존재하지 않습니다.",
        },
        { status: 404 },
      );
    }

    // 🎯 데이터베이스에 디자이너 레코드 생성 (INSERT)
    const newDesigner = await prisma.designer.create({
      //
      data: {
        shopId: userShop.shopId, //
        designerName, //
        position, //
        isActive: true, // 기본 활성화 상태 적용
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "디자이너가 성공적으로 등록되었습니다.",
        data: newDesigner,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🚨 디자이너 등록 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

// src/app/api/v1/designers/route.ts 파일의 기존 코드 아래에 추가해 주세요!

/**
 * 🔄 3. 디자이너 활성화/비활성화 상태 토글 (PATCH)
 */
export async function PATCH(request: Request) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: "인증 정보가 유효하지 않습니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { designerId, isActive } = body;

    if (designerId === undefined || isActive === undefined) {
      return NextResponse.json(
        { success: false, error: "필수 요청 데이터가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 오너의 매장 확인
    const userShop = await prisma.shop.findFirst({
      where: { ownerId: user.userId },
      select: { shopId: true },
    });

    if (!userShop) {
      return NextResponse.json(
        { success: false, error: "매장 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 🎯 해당 매장의 디자이너 상태 업데이트
    const updatedDesigner = await prisma.designer.updateMany({
      where: {
        designerId: parseInt(designerId, 10),
        shopId: userShop.shopId, // 다른 매장의 디자이너를 수정하지 못하도록 방어
      },
      data: { isActive },
    });

    if (updatedDesigner.count === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "수정하려는 디자이너가 존재하지 않거나 권한이 없습니다.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "디자이너 상태가 변경되었습니다.",
    });
  } catch (error) {
    console.error("🚨 디자이너 상태 변경 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/**
 * ❌ 4. 디자이너 명단 삭제 (DELETE)
 */
export async function DELETE(request: Request) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: "인증 정보가 유효하지 않습니다." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const designerIdStr = searchParams.get("designerId");

    if (!designerIdStr) {
      return NextResponse.json(
        { success: false, error: "삭제할 designerId가 필요합니다." },
        { status: 400 },
      );
    }

    const designerId = parseInt(designerIdStr, 10);

    const userShop = await prisma.shop.findFirst({
      where: { ownerId: user.userId },
      select: { shopId: true },
    });

    if (!userShop) {
      return NextResponse.json(
        { success: false, error: "매장 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 🎯 안전하게 매장 ID 조건까지 묶어서 삭제 진행
    const deleted = await prisma.designer.deleteMany({
      where: {
        designerId: designerId,
        shopId: userShop.shopId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "삭제하려는 디자이너가 존재하지 않거나 권한이 없습니다.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "디자이너가 명단에서 삭제되었습니다.",
    });
  } catch (error) {
    console.error("🚨 디자이너 삭제 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
