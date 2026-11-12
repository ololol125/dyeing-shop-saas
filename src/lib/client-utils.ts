// 사장님 웹(브라우저)에서 공통으로 쓰는 도우미

// 로그인 시 저장한 토큰 쿠키 읽기
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

// API 호출용 인증 헤더
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getCookie("token");
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function errorMessage(err: unknown, fallback = "잠시 후 다시 시도해 주세요."): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// 6000 → "6,000원"
export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

const KST = "Asia/Seoul";

// → "11월 14일 (금)"
export function formatKstDate(iso: string | Date): string {
  const d = new Date(iso);
  const month = d.toLocaleString("ko-KR", { month: "numeric", timeZone: KST });
  const day = d.toLocaleString("ko-KR", { day: "numeric", timeZone: KST });
  const weekday = d.toLocaleString("ko-KR", { weekday: "short", timeZone: KST });
  return `${month} ${day} (${weekday})`;
}

// → "오후 2:30"
export function formatKstTime(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: KST,
  });
}

// → "2026년 11월 14일"
export function formatKstFullDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: KST,
  });
}

export function menuLabel(menuType: string): string {
  if (menuType === "ROOT_DYE") return "뿌리 염색";
  if (menuType === "FULL_DYE") return "전체 염색";
  return menuType;
}
