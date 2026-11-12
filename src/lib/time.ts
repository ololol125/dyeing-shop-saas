// 매장 운영 기준 시간대(한국 표준시, UTC+9) 관련 유틸.
// 서버(Vercel)는 UTC로 동작하므로 "오늘/이번 달" 범위나 시각 표시는 반드시 KST 기준으로 계산한다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const TIMEZONE_SUFFIX = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * 예약 일시 문자열을 Date로 변환한다.
 * 시간대가 없는 값(예: "2026-11-14T14:30:00")은 한국 시간으로 해석한다
 * (구버전 앱은 시간대 없이 현지 시각을 보냄).
 */
export function parseKstDateTime(value: string): Date {
  const trimmed = value.trim();
  return new Date(TIMEZONE_SUFFIX.test(trimmed) ? trimmed : `${trimmed}+09:00`);
}

// KST 기준 해당 날짜의 시작 ~ 끝 (UTC Date)
export function kstDayRange(now = new Date()): { start: Date; end: Date } {
  const k = new Date(now.getTime() + KST_OFFSET_MS);
  const start = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()) - KST_OFFSET_MS;
  return { start: new Date(start), end: new Date(start + 24 * 60 * 60 * 1000 - 1) };
}

// KST 기준 해당 월의 시작 ~ 끝 (UTC Date)
export function kstMonthRange(now = new Date()): { start: Date; end: Date } {
  const k = new Date(now.getTime() + KST_OFFSET_MS);
  const start = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), 1) - KST_OFFSET_MS;
  const end = Date.UTC(k.getUTCFullYear(), k.getUTCMonth() + 1, 1) - KST_OFFSET_MS - 1;
  return { start: new Date(start), end: new Date(end) };
}

// KST 기준 "HH:mm"
export function formatKstTime(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().substring(11, 16);
}
