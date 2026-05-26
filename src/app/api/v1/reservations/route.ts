import { NextResponse } from "next/server";

// 🟢 포스트맨/Fern에서 [POST] /api/v1/reservations 요청이 들어올 때 실행
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 💡 W3 단계에서 여기에 들어갈 비즈니스 로직 및 물리 DB 매핑 규칙 메모:
    // 1. RESERVATION 테이블에 기본 정보 INSERT
    // 2. body.designerId가 존재하면 ASSIGNED_TO 교차 테이블에 복합키로 추가 INSERT (하나의 트랜잭션)

    return NextResponse.json(
      {
        success: true,
        reservationId: "res_mock_sample_9988",
        status: "CONFIRMED",
        receivedData: body, // 보낸 데이터를 그대로 반환하여 연결 체킹용으로 사용
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Bad Request" },
      { status: 400 },
    );
  }
}
