import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dyeing-shop-saas-secret-key-1234";

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
}

// 🟢 기존에 만든 검증 함수
export function verifyAuth(request: Request): AuthUser | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * 🟢 [새로 추가] 로그인 성공 시 JWT 토큰을 발급해주는 공통 함수
 */
export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
