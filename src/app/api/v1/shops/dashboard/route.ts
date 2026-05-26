import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        success: true,
        message: "디자이너 등록 성공 (Mock)",
        receivedData: body,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Bad Request" },
      { status: 400 },
    );
  }
}
