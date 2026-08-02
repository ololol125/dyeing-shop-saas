import "dotenv/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * ⚠️ 서비스 롤 키는 RLS를 우회하므로 서버 코드(API 라우트)에서만 사용해야 합니다.
 * 호출 시점까지 초기화를 미뤄, 환경변수가 비어있어도 모듈 로드 자체는 실패하지
 * 않게 합니다(모듈 로드 중 예외가 나면 Next.js가 JSON 대신 HTML 에러 페이지를
 * 반환해 클라이언트의 res.json() 파싱이 깨집니다).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase 설정이 완료되지 않았습니다. .env의 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 확인해 주세요.",
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

export const POST_IMAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || "post-images";
