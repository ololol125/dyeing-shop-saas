import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { getSupabaseAdmin, POST_IMAGE_BUCKET } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 공개 이미지 URL에서 스토리지 내부 경로만 추출 (교체/삭제 시 기존 파일 정리용)
function extractStoragePath(imageUrl: string): string | null {
  const marker = `/storage/v1/object/public/${POST_IMAGE_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return imageUrl.slice(idx + marker.length);
}

/**
 * 📄 게시물 상세 공개 조회 (GET, 로그인 불필요)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const postIdNum = parseInt(postId, 10);

    if (Number.isNaN(postIdNum)) {
      return NextResponse.json(
        { success: false, error: "올바르지 않은 게시물 ID입니다." },
        { status: 400 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { postId: postIdNum },
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

    if (!post) {
      return NextResponse.json(
        { success: false, error: "게시물을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        shop: {
          ...post.shop,
          latitude: Number(post.shop.latitude),
          longitude: Number(post.shop.longitude),
        },
      },
    });
  } catch (error) {
    console.error("🚨 게시물 상세 조회 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/**
 * ✏️ 게시물 수정 (PATCH, 로그인 필요, 소유 매장의 게시물만 가능)
 * multipart/form-data: title?, content?, status?, image?
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { postId } = await params;
    const postIdNum = parseInt(postId, 10);
    if (Number.isNaN(postIdNum)) {
      return NextResponse.json(
        { success: false, error: "올바르지 않은 게시물 ID입니다." },
        { status: 400 },
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { postId: postIdNum },
      include: { shop: { select: { ownerId: true } } },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "게시물을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (existingPost.shop.ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, error: "본인 매장의 게시물만 수정할 수 있습니다." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string | null;
    const content = formData.get("content") as string | null;
    const status = formData.get("status") as string | null;
    const image = formData.get("image") as File | null;

    let imageUrl = existingPost.imageUrl;

    if (image && image.size > 0) {
      const supabaseAdmin = getSupabaseAdmin();
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = image.name.split(".").pop() || "jpg";
      const filePath = `${existingPost.shopId}/${Date.now()}.${fileExt}`;

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

      // 기존 이미지 정리 (실패해도 게시물 저장 자체는 계속 진행)
      if (existingPost.imageUrl) {
        const oldPath = extractStoragePath(existingPost.imageUrl);
        if (oldPath) {
          await supabaseAdmin.storage.from(POST_IMAGE_BUCKET).remove([oldPath]);
        }
      }

      imageUrl = publicUrlData.publicUrl;
    }

    const updatedPost = await prisma.post.update({
      where: { postId: postIdNum },
      data: {
        title: title ?? undefined,
        content: content !== null ? content || null : undefined,
        status: status ?? undefined,
        imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "게시물이 수정되었습니다.",
      data: updatedPost,
    });
  } catch (error) {
    console.error("🚨 게시물 수정 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/**
 * 🗑️ 게시물 삭제 (DELETE, 로그인 필요, 소유 매장의 게시물만 가능)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const user = verifyAuth(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: "인증 정보가 유효하지 않습니다. 로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { postId } = await params;
    const postIdNum = parseInt(postId, 10);
    if (Number.isNaN(postIdNum)) {
      return NextResponse.json(
        { success: false, error: "올바르지 않은 게시물 ID입니다." },
        { status: 400 },
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { postId: postIdNum },
      include: { shop: { select: { ownerId: true } } },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "게시물을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (existingPost.shop.ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, error: "본인 매장의 게시물만 삭제할 수 있습니다." },
        { status: 403 },
      );
    }

    await prisma.post.delete({ where: { postId: postIdNum } });

    if (existingPost.imageUrl) {
      const oldPath = extractStoragePath(existingPost.imageUrl);
      if (oldPath) {
        await getSupabaseAdmin()
          .storage.from(POST_IMAGE_BUCKET)
          .remove([oldPath]);
      }
    }

    return NextResponse.json({ success: true, message: "게시물이 삭제되었습니다." });
  } catch (error) {
    console.error("🚨 게시물 삭제 API 에러:", error);
    return NextResponse.json(
      { success: false, error: "서버 내부 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
