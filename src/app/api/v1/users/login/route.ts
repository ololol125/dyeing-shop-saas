import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. 유효성 검사 (이메일이나 비밀번호가 비어있는지 체크)
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "이메일과 비밀번호를 모두 입력해주세요." },
        { status: 400 },
      );
    }

    // 2. [임시 하드코딩] 테스트용 로그인 처리
    // 나중에 이 부분에 DB 유저 조회 및 bcrypt 비밀번호 비교 로직이 들어갑니다.
    if (email === "test@test.com" && password === "1234") {
      // 3. 로그인 성공 시 프론트엔드(Flutter)에 넘겨줄 표준 응답 데이터 구조
      return NextResponse.json(
        {
          success: true,
          message: "로그인 인증에 성공했습니다.",
          // 📦 유저 정보 세션
          user: {
            id: "usr_20260605",
            email: email,
            name: "홍길동",
            role: "CUSTOMER", // CUSTOMER 또는 DESIGNER, ADMIN 등
          },
          // 🎫 중요 ⭐: 앞으로 모든 비밀 보안 API 주소에 프리패스로 쓰일 암호화 토큰
          // 실제 서비스에서는 jwt 라이브러리로 생성하지만, 구조 연동을 위해 표준 양식으로 제공합니다.
          accessToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token_for_dyeing_shop_saas_auth_session",
        },
        { status: 200 }, // 로그인 성공은 보통 200 OK를 씁니다.
      );
    }

    // 4. 로그인 정보가 틀렸을 때의 예외 처리
    return NextResponse.json(
      { success: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." },
      { status: 401 }, // 401 Unauthorized
    );
  } catch (error) {
    console.error("🚨 로그인 라우트 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
