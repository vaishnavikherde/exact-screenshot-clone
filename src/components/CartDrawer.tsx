import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Sparkles, Tag, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  FREE_DELIVERY_THRESHOLD,
  addToCart,
  applyCoupon,
  removeLine,
  setQty,
  useAppState,
  useCartSummary,
} from "@/lib/cart";
import { forgottenSuggestion } from "@/lib/ai";
import { confettiBurst } from "@/lib/animations";
import { setCartOpen, useUI } from "@/lib/ui";
import { inr } from "@/lib/utils";
import { ProductArt } from "./ProductCard";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const navigate = useNavigate();
  const summary = useCartSummary();
  const coupon = useAppState((s) => s.coupon);
  const [code, setCode] = useState("");
  const crossed = useRef(false);

  useEffect(() => {
    const free = summary.itemTotal >= FREE_DELIVERY_THRESHOLD;
    if (free && !crossed.current && summary.itemTotal > 0) {
      crossed.current = true;
      if (open) confettiBurst();
      toast.success("Free delivery unlocked!");
    }
    if (!free) crossed.current = false;
  }, [summary.itemTotal, open]);

  const nudge = open ? forgottenSuggestion() : null;
  const progress = Math.min(100, (summary.itemTotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <Sheet open={open} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="text-lg font-extrabold">
            Your cart {summary.count > 0 && <span className="text-muted-foreground">({summary.count})</span>}
          </SheetTitle>
        </SheetHeader>

        {summary.count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="text-6xl" aria-hidden="true">🧺</span>
            <p className="text-base font-bold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Fresh picks are one tap away.</p>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground active:scale-95"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="rounded-2xl border border-primary/30 bg-primary-soft p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Truck className="size-4" />
                  {summary.toFreeDelivery > 0
                    ? `Add ${inr(summary.toFreeDelivery)} more for free delivery`
                    : "Yay! You get free delivery"}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {summary.items.map(({ line, product, price }) => (
                  <li key={`${line.productId}-${line.unit}`} className="flex items-center gap-3">
                    <ProductArt product={product} className="size-14 shrink-0" size="text-2xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{line.unit}</p>
                      <p className="text-sm font-extrabold">{inr(price * line.qty)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-xl bg-primary px-1 py-1 text-primary-foreground">
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name}`}
                        onClick={() => setQty(line.productId, line.unit, line.qty - 1)}
                        className="grid size-7 place-items-center rounded-lg active:scale-90"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-5 text-center text-sm font-bold">{line.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name}`}
                        onClick={() =>
                          setQty(line.productId, line.unit, Math.min(product.maxQty, line.qty + 1))
                        }
                        className="grid size-7 place-items-center rounded-lg active:scale-90"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${product.name}`}
                      onClick={() => removeLine(line.productId, line.unit)}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>

              {nudge && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ai/30 bg-ai/5 p-3">
                  <Sparkles className="size-4 shrink-0 text-ai" />
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold">
                    You might have forgotten: {nudge.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => addToCart(nudge)}
                    className="shrink-0 rounded-lg bg-ai px-3 py-1.5 text-xs font-bold text-ai-foreground active:scale-95"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    aria-label="Coupon code"
                    placeholder="Try FRESH50"
                    className="rounded-xl pl-9"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    applyCoupon(code)
                      ? toast.success(`Coupon ${code} applied`)
                      : toast.error("Invalid coupon")
                  }
                  className="rounded-xl border border-border px-4 text-sm font-bold hover:bg-muted"
                >
                  Apply
                </button>
              </div>

              <dl className="mt-4 space-y-2 rounded-2xl border border-border p-4 text-sm">
                <Row label="Item total" value={inr(summary.itemTotal)} />
                {summary.couponOff > 0 && (
                  <Row label={`Coupon ${coupon}`} value={`-${inr(summary.couponOff)}`} good />
                )}
                <Row
                  label="Delivery fee"
                  value={summary.delivery === 0 ? "FREE" : inr(summary.delivery)}
                  good={summary.delivery === 0}
                />
                <Row label="Handling fee" value={inr(summary.handling)} />
                <Row label="GST & charges" value={inr(summary.gst)} />
                <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold">
                  <dt>To pay</dt>
                  <dd>{inr(summary.total)}</dd>
                </div>
                {summary.savings > 0 && (
                  <p className="rounded-lg bg-primary-soft px-2 py-1 text-center text-xs font-bold text-primary">
                    You saved {inr(summary.savings)} on this order
                  </p>
                )}
              </dl>
            </div>

            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate({ to: "/checkout" });
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground transition active:scale-[0.98]"
              >
                <span>{inr(summary.total)}</span>
                <span>Proceed to Pay →</span>
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={good ? "font-bold text-primary" : "font-semibold"}>{value}</dd>
    </div>
  );
}
