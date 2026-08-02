import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { getSupabaseAdmin, POST_IMAGE_BUCKET } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * 📰 소비자 앱 홈 화면 피드용 게시물 공개 목록 조회 (GET, 로그인 불필요)
 * 공개(PUBLISHED) 상태의 게시물만 매장 정보와 함께 반환합니다.
 */
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        shop: {
          select: {
            shopId: true,
            shopName: true,
            baseAddress: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    const formatted = posts.map((post) => ({
      ...post,
      shop: {
        ...post.shop,
        latitude: Number(post.shop.latitude),
        longitude: Number(post.shop.longitude),
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("🚨 게시물 목록 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/**
 * 🆕 파트너(오너)가 자기 매장의 게시물을 새로 등록 (POST, 로그인 필요)
 * multipart/form-data: title, content?, status?, image?
 */
export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다." },
        { status: 401 },
      );
    }

    if (user.role !== "SHOP_OWNER") {
      return NextResponse.json(
        { success: false, error: "게시물 등록은 오너 계정만 가능합니다." },
        { status: 403 },
      );
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: user.userId },
      select: { shopId: true },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "등록된 매장이 없습니다. 매장을 먼저 등록해 주세요." },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string | null;
    const content = formData.get("content") as string | null;
    const status = (formData.get("status") as string | null) || "PUBLISHED";
    const image = formData.get("image") as File | null;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "게시물 제목을 입력해 주세요." },
        { status: 400 },
      );
    }

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const supabaseAdmin = getSupabaseAdmin();
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = image.name.split(".").pop() || "jpg";
      const filePath = `${shop.shopId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(POST_IMAGE_BUCKET)
        .upload(filePath, buffer, {
          contentType: image.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("🚨 이미지 업로드 실패:", uploadError);
        return NextResponse.json(
          { success: false, error: "이미지 업로드에 실패했습니다." },
          { status: 500 },
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(POST_IMAGE_BUCKET)
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const newPost = await prisma.post.create({
      data: {
        shopId: shop.shopId,
        title,
        content: content || null,
        status,
        imageUrl,
      },
    });

    return NextResponse.json(
      { success: true, message: "게시물이 등록되었습니다.", data: newPost },
      { status: 201 },
    );
  } catch (error) {
    console.error("🚨 게시물 등록 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
