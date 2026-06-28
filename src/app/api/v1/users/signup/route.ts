export const dynamic = "force-dynamic"; // 🟢 Next.js가 빌드 타임에 이 코드를 미리 실행하지 않도록 강제 설정

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// 🔌 Prisma Client 인스턴스 생성

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role } = body;

    // 1. 필수 데이터 누락 유효성 검사 API 명세서 및 CI-CD 파이프라인 구축.pdf]
    if (!email || !password || !name || !phone || !role) {
      return NextResponse.json(
        { success: false, error: "모든 필수 항목을 입력해 주세요." },
        { status: 400 },
      );
    }

    // 2. 가입 가능한 올바른 역할(Role)인지 검사 API 명세서 및 CI-CD 파이프라인 구축.pdf]
    if (role !== "SHOP_OWNER" && role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "올바르지 않은 사용자 역할(Role)입니다." },
        { status: 400 },
      );
    }

    // 3. 중복 이메일 가입 방지 체크
    const existingUser = await prisma.appUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "이미 가입된 이메일 주소입니다." },
        { status: 409 }, // 409 Conflict
      );
    }

    // 4. 🔐 비밀번호 단방향 암호화 (해싱 처리)
    // 숫자가 높을수록 보안성이 올라가며, 가성비가 가장 좋은 10 라운드를 채택합니다.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. 🎯 Supabase app_user 테이블에 진짜 회원 레코드 인서트(INSERT)
    const newUser = await prisma.appUser.create({
      data: {
        email,
        passwordHash: hashedPassword, // 암호화된 비밀번호 저장
        name,
        phone,
        role,
      },
    });

    // 6. 성공적인 회원가입 결과 반환 (보안상 passwordHash는 제외하고 리턴)
    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🚨 회원가입 라우트 서버 내부 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
