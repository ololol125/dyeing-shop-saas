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

// 시술 종류 (가격은 매장마다 다르다)
const MENUS = [
  {
    key: "rootPrice",
    name: "뿌리 염색",
    description: "새로 자라난 뿌리 부분만 기존 머리색에 맞춰 염색하는 시술입니다.",
    duration: "약 40분 ~ 1시간",
  },
  {
    key: "fullPrice",
    name: "전체 염색",
    description:
      "머리 전체를 원하는 색으로 염색하는 시술입니다. 단발 기준 가격이며, 머리 길이에 따라 매장에서 추가 요금이 생길 수 있습니다.",
    duration: "약 1시간 ~ 1시간 30분",
  },
] as const;

// 판매 중인 상품 = 매장 × 시술 (가격이 0원인 시술은 판매하지 않는 것으로 본다)
// 앱 심사용 테스트 매장(사업자번호 TEST-)은 실제 판매 상품이 아니므로 제외한다
async function getShopProducts() {
  const shops = await prisma.shop.findMany({
    where: { NOT: { businessNumber: { startsWith: "TEST-" } } },
    select: { shopId: true, shopName: true, baseAddress: true, rootPrice: true, fullPrice: true },
    orderBy: { shopName: "asc" },
  });
  return shops
    .map((shop) => ({
      ...shop,
      products: MENUS.filter((m) => shop[m.key] > 0).map((m) => ({ name: m.name, price: shop[m.key] })),
    }))
    .filter((shop) => shop.products.length > 0);
}

export default async function ServicesPage() {
  const shops = await getShopProducts();
  const productCount = shops.reduce((n, s) => n + s.products.length, 0);

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
          시술을 받습니다. 결제는 {BUSINESS.name}가 받으며, 취소·환불도 {BUSINESS.name}가
          책임지고 처리합니다.
        </p>

        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">
              판매 상품 (매장별 시술 예약)
              {productCount > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-500">총 {productCount}개</span>
              )}
            </h2>

            {shops.length > 0 ? (
              <div className="space-y-4">
                {shops.map((shop) => (
                  <div key={shop.shopId} className="rounded-lg border border-slate-200 p-5">
                    <h3 className="text-base font-bold text-slate-900">{shop.shopName}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{shop.baseAddress}</p>
                    <ul className="mt-3 divide-y divide-slate-100">
                      {shop.products.map((p) => (
                        <li key={p.name} className="flex items-baseline justify-between gap-3 py-2">
                          <span className="text-slate-800">{p.name} 예약</span>
                          <span className="text-base font-black text-slate-900 tabular-nums">{won(p.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-slate-200 p-5">
                입점 매장을 준비하고 있습니다. 매장이 등록되면 매장별 시술과 가격이 이곳에 표시됩니다.
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              앱의 매장 화면과 결제 화면에 표시된 금액으로 결제되며, 매장이 가격을 바꾸면 이 목록에도 바로 반영됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">시술 안내</h2>
            <div className="space-y-3">
              {MENUS.map((m) => (
                <div key={m.key}>
                  <h3 className="font-bold text-slate-900">{m.name}</h3>
                  <p>{m.description}</p>
                  <p className="text-xs text-slate-500">소요 시간: {m.duration}</p>
                </div>
              ))}
            </div>
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
