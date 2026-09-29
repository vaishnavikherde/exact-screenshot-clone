import { useEffect, useState } from "react";
import { Star, Clock3, Leaf } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getProduct } from "@/lib/catalog";
import { frequentlyBoughtWith, similarProducts } from "@/lib/ai";
import { addToCart } from "@/lib/cart";
import { openProduct, useUI } from "@/lib/ui";
import { cn, discountPct, inr } from "@/lib/utils";
import { ProductArt, ProductCard, QtyStepper } from "./ProductCard";

export function ProductSheet() {
  const id = useUI((s) => s.sheetProductId);
  const product = id ? getProduct(id) : undefined;
  const [unit, setUnit] = useState<string | null>(null);

  useEffect(() => {
    setUnit(product?.unit ?? null);
  }, [product?.id, product?.unit]);

  if (!product) return null;
  const variant = product.variants?.find((v) => v.unit === unit) ?? {
    unit: product.unit,
    price: product.price,
    mrp: product.mrp,
  };
  const fbt = frequentlyBoughtWith(product);
  const fbtTotal = fbt.reduce((n, p) => n + p.price, variant.price);

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && openProduct(null)}>
      <SheetContent
        side="bottom"
        className="glass max-h-[92vh] overflow-y-auto rounded-t-3xl border-border p-0 sm:max-w-full"
      >
        <div className="mx-auto w-full max-w-3xl p-5">
          <SheetHeader className="p-0 text-left">
            <SheetTitle className="text-xl font-extrabold">{product.name}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="grid grid-cols-3 gap-2">
              <ProductArt product={product} className="col-span-3 aspect-[4/3] w-full" size="text-7xl" />
              {[0, 1, 2].map((i) => (
                <ProductArt key={i} product={product} className="aspect-square w-full" size="text-2xl" />
              ))}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  <Clock3 className="size-3" /> {product.eta} mins
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  <Star className="size-3 fill-accent text-accent" /> {product.rating}
                </span>
                {product.diet.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-primary"
                  >
                    <Leaf className="size-3" /> {d}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants?.map((v) => (
                  <button
                    key={v.unit}
                    type="button"
                    onClick={() => setUnit(v.unit)}
                    aria-pressed={unit === v.unit}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                      unit === v.unit
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {v.unit} · {inr(v.price)}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <p className="text-2xl font-extrabold">{inr(variant.price)}</p>
                {discountPct(variant.price, variant.mrp) > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground line-through">{inr(variant.mrp)}</p>
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-foreground">
                      {discountPct(variant.price, variant.mrp)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="mt-4 w-40">
                <QtyStepper product={product} unit={variant.unit} />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

              <dl className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-border p-3 text-center">
                {Object.entries(product.nutrition).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="text-sm font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-ai/30 bg-ai/5 p-4">
            <h3 className="text-sm font-extrabold">Frequently bought together</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {[product, ...fbt].map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  {i > 0 && <span className="text-muted-foreground">+</span>}
                  <div className="flex items-center gap-2">
                    <ProductArt product={p} className="size-12" size="text-xl" />
                    <span className="max-w-24 text-xs font-semibold">{p.name}</span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => [product, ...fbt].forEach((p) => addToCart(p))}
                className="ml-auto rounded-xl bg-ai px-4 py-2 text-sm font-bold text-ai-foreground transition active:scale-95"
              >
                Add all · {inr(fbtTotal)}
              </button>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-extrabold">Similar products</h3>
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
              {similarProducts(product).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
