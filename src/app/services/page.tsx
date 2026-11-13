import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "서비스 및 요금 안내 | 염색온",
};

// 매장 가격이 바뀌면 바로 반영되도록 요청마다 DB에서 읽는다
export const dynamic = "force-dynamic";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

// 등록된 매장들의 가격 범위 (매장이 없으면 null)
async function getPriceRange() {
  const agg = await prisma.shop.aggregate({
    _min: { rootPrice: true, fullPrice: true },
    _max: { rootPrice: true, fullPrice: true },
    _count: true,
  });
  if (!agg._count) return null;
  return {
    shopCount: agg._count,
    root: { min: agg._min.rootPrice ?? 0, max: agg._max.rootPrice ?? 0 },
    full: { min: agg._min.fullPrice ?? 0, max: agg._max.fullPrice ?? 0 },
  };
}

const range = (r: { min: number; max: number }) =>
  r.min === r.max ? won(r.min) : `${won(r.min)} ~ ${won(r.max)}`;

export default async function ServicesPage() {
  const prices = await getPriceRange();

  const services = [
    {
      name: "뿌리 염색 예약",
      description:
        "새로 자라난 뿌리 부분만 기존 머리색에 맞춰 염색하는 시술입니다. 앱에서 매장·담당 디자이너·날짜·시간을 골라 예약하고 시술 요금을 미리 결제합니다.",
      duration: "약 40분 ~ 1시간",
      price: prices ? range(prices.root) : "매장별 상이",
    },
    {
      name: "전체 염색 예약",
      description:
        "머리 전체를 원하는 색으로 염색하는 시술입니다. 단발 기준 가격이며, 머리 길이에 따라 매장에서 추가 요금이 생길 수 있습니다.",
      duration: "약 1시간 ~ 1시간 30분",
      price: prices ? range(prices.full) : "매장별 상이",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인으로</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          서비스 및 요금 안내
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          염색온은 동네 염색방의 염색 시술을 앱에서 예약하고 미리 결제하는 서비스입니다.
          손님은 염색온 앱(Android·iOS)에서 시술 요금을 결제하고, 예약한 날짜에 매장을 방문해
          시술을 받습니다.
        </p>

        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">판매 상품 (시술 예약)</h2>
            <div className="space-y-4">
              {services.map((s) => (
                <div key={s.name} className="rounded-lg border border-slate-200 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                    <p className="text-lg font-black text-slate-900">{s.price}</p>
                  </div>
                  <p className="mt-2">{s.description}</p>
                  <p className="mt-2 text-xs text-slate-500">소요 시간: {s.duration}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {prices
                ? `현재 등록된 매장 ${prices.shopCount}곳의 가격 범위입니다. `
                : ""}
              정확한 가격은 매장마다 다르며, 앱의 매장 화면과 결제 화면에 표시된 금액으로 결제됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">이용 방법</h2>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>염색온 앱에서 지도나 목록으로 가까운 염색방을 찾습니다.</li>
              <li>시술(뿌리 염색·전체 염색), 담당 디자이너, 날짜와 시간을 고릅니다.</li>
              <li>신용카드 또는 카카오페이로 시술 요금을 결제하면 예약이 확정됩니다.</li>
              <li>예약한 날짜에 매장을 방문해 시술을 받습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">결제 수단</h2>
            <p>신용카드·체크카드, 카카오페이</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">서비스 제공 기간</h2>
            <p>
              결제일로부터 최대 14일 이내의 예약한 날짜에 매장에서 시술을 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">취소 및 환불</h2>
            <p>
              예약 24시간 전까지 취소하면 전액 환불됩니다. 자세한 기준은{" "}
              <Link href="/refund" className="font-semibold text-violet-600 underline">
                취소·환불 규정
              </Link>
              을 확인해 주세요.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100 text-xs text-slate-400">
            <p>상호명: {BUSINESS.name}</p>
            <p>대표자: {BUSINESS.ceo}</p>
            <p>사업자등록번호: {BUSINESS.registrationNumber}</p>
            {BUSINESS.mailOrderNumber && <p>통신판매업 신고번호: {BUSINESS.mailOrderNumber}</p>}
            <p>사업장주소: {BUSINESS.address}</p>
            <p>전화번호: {BUSINESS.phone}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
