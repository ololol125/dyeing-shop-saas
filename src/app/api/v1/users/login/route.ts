import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 🟢 기존 import { PrismaClient } 지우고 이것으로 변경!
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🔐 JWT 토큰을 서명할 때 쓸 비밀키 (실무에서는 .env에 넣어야 하며, 없으면 임시 문자열 사용)
const JWT_SECRET = process.env.JWT_SECRET || "dyeing-shop-saas-secret-key-1234";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. 유효성 검사 (이메일, 비밀번호 필수) API 명세서 및 CI-CD 파이프라인 구축.pdf]
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "이메일과 비밀번호를 모두 입력해 주세요." },
        { status: 400 },
      );
    }

    // 2. Supabase DB에서 해당 이메일을 가진 유저가 있는지 조회
    const user = await prisma.appUser.findUnique({
      where: { email },
    });

    // 유저가 존재하지 않으면 401 반환 (보안상 이메일/비번 중 뭐가 틀렸는지 숨기는 것이 정석)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." },
        { status: 401 },
      );
    }

    // 3. 🔐 입력된 비밀번호와 DB에 저장된 암호화 비밀번호(passwordHash) 대조 (bcrypt 비교)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." },
        { status: 401 },
      );
    }

    // 4. 🎟️ 인증 성공! 유저 고유 ID와 권한(Role)을 인코딩한 JWT 토큰 생성 (유효기간 7일)
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 5. 프론트엔드(Flutter)가 세션을 유지할 수 있도록 토큰과 유저 기본 정보 반환 API 명세서 및 CI-CD 파이프라인 구축.pdf]
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
