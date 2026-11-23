import type { Quote } from "@/lib/pricing";
import { packingLabel, usd, zig } from "@/lib/pricing";

export function PriceBreakdown({ q }: { q: Quote }) {
  return (
    <dl className="space-y-2 text-sm">
      <Row label={`${q.qty} × ${usd(q.unitPriceUsd)}`} value={usd(q.subtotalUsd)} />
      {q.discountPct > 0 ? (
        <Row label={`Bulk discount (${q.discountPct}%)`} value={`−${usd(q.discountUsd)}`} accent />
      ) : null}
      {q.mode === "delivery" ? (
        <Row label="Delivery" value={q.deliveryEligible && q.deliveryFeeUsd > 0 ? usd(q.deliveryFeeUsd) : "—"} />
      ) : (
        <Row label="Collection" value="Free" />
      )}
      <div className="my-2 border-t border-dashed border-black/10" />
      <div className="flex items-baseline justify-between">
        <dt className="font-bold">Total</dt>
        <dd className="text-right">
          <span className="block text-xl font-black">{usd(q.totalUsd)}</span>
          <span className="block text-xs text-muted">≈ {zig(q.totalZig)}</span>
        </dd>
      </div>
      <p className="pt-1 text-xs text-muted">Packed as {packingLabel(q.qty)}</p>
    </dl>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={accent ? "font-semibold text-leaf-600" : "font-medium"}>{value}</dd>
    </div>
  );
}
