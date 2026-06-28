import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth"; // 🟢 공통 토큰 발급 함수 임포트!

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "이메일과 비밀번호를 모두 입력해 주세요." },
        { status: 400 },
      );
    }

    // 2. 유저 조회
    const user = await prisma.appUser.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." },
        { status: 401 },
      );
    }

    // 3. 비밀번호 대조
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." },
        { status: 401 },
      );
    }

    // 4. 🎟️ lib에서 가져온 함수로 토큰 깔끔하게 생성!
    const token = signToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    // 5. 응답 반환
    return NextResponse.json(
      {
        success: true,
        message: "로그인에 성공했습니다.",
        token,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("🚨 로그인 라우트 서버 내부 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
