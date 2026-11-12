import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 회원 탈퇴 (DELETE) - 소비자 앱 전용
//
// 결제·예약 기록은 전자상거래법상 5년 보관 의무가 있어 행 자체를 지우지 않고,
// 계정의 개인정보(이름·이메일·전화번호·비밀번호)를 지워 누구인지 알 수 없게 만든다.
// 손님 개인 메모 성격인 시술 기록(hair_history)은 삭제한다.
export async function DELETE(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded?.userId) {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }

    const user = await prisma.appUser.findUnique({ where: { userId: decoded.userId } });
    if (!user || user.role === "WITHDRAWN") {
      return NextResponse.json({ success: false, error: "이미 탈퇴했거나 없는 계정입니다." }, { status: 404 });
    }
    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "사장님 계정은 고객센터(053-957-6388)로 탈퇴를 요청해 주세요." },
        { status: 403 },
      );
    }

    // 다가오는 예약이 있으면 매장과 정리한 뒤 탈퇴하도록 안내 (결제된 예약이 붕 뜨지 않도록)
    const upcoming = await prisma.reservation.count({
      where: { clientId: user.userId, status: "CONFIRMED", reservationTime: { gt: new Date() } },
    });
    if (upcoming > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `다가오는 예약이 ${upcoming}건 있어요. 매장에 연락해 예약을 정리한 뒤 탈퇴해 주세요.`,
          reason: "UPCOMING_RESERVATIONS",
        },
        { status: 409 },
      );
    }

    await prisma.$transaction([
      prisma.hairHistory.deleteMany({ where: { clientId: user.userId } }),
      prisma.appUser.update({
        where: { userId: user.userId },
        data: {
          name: "탈퇴한 회원",
          // 같은 이메일로 다시 가입할 수 있도록 원래 이메일은 비워 둔다
          email: `withdrawn-${user.userId}-${Date.now()}@withdrawn.invalid`,
          phone: "",
          passwordHash: "!withdrawn", // bcrypt 형식이 아니므로 어떤 비밀번호로도 로그인 불가
          role: "WITHDRAWN",
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "탈퇴가 완료되었습니다." });
  } catch (err) {
    console.error("🚨 회원 탈퇴 에러:", err);
    return NextResponse.json({ success: false, error: "탈퇴를 처리하지 못했습니다." }, { status: 500 });
  }
}
