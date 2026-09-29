import { useRef, useState } from "react";
import { Heart, Minus, Plus, Clock3, Star } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/lib/types";
import { TINTS } from "@/lib/catalog";
import { addToCart, setQty, useQty, useWishlist, toggleWishlist } from "@/lib/cart";
import { flyToCart } from "@/lib/animations";
import { openProduct } from "@/lib/ui";
import { cn, discountPct, inr } from "@/lib/utils";

export function ProductArt({
  product,
  className,
  size = "text-5xl",
}: {
  product: Product;
  className?: string;
  size?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
        TINTS[product.tint] ?? TINTS.stone,
        className,
      )}
    >
      <span className={size}>{product.emoji}</span>
    </div>
  );
}

export function QtyStepper({ product, unit }: { product: Product; unit?: string }) {
  const u = unit ?? product.unit;
  const qty = useQty(product.id, u);
  const ref = useRef<HTMLDivElement>(null);

  const add = () => {
    if (qty >= product.maxQty) {
      toast.warning(`Max ${product.maxQty} per order`);
      return;
    }
    addToCart(product, u);
    flyToCart(ref.current, product.emoji);
    toast.success(`${product.name} added`, {
      action: { label: "Undo", onClick: () => setQty(product.id, u, Math.max(0, qty)) },
    });
  };

  if (qty === 0) {
    return (
      <div ref={ref}>
        <button
          type="button"
          onClick={add}
          aria-label={`Add ${product.name} to cart`}
          className="animate-pop-in w-full rounded-xl border border-primary/40 bg-primary-soft px-4 py-1.5 text-sm font-bold text-primary transition active:scale-95 hover:bg-primary hover:text-primary-foreground"
        >
          ADD
        </button>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="animate-pop-in flex items-center justify-between rounded-xl bg-primary px-1 py-1 text-primary-foreground"
    >
      <button
        type="button"
        onClick={() => setQty(product.id, u, qty - 1)}
        aria-label={`Remove one ${product.name}`}
        className="grid size-7 place-items-center rounded-lg transition active:scale-90 hover:bg-primary-foreground/15"
      >
        <Minus className="size-4" />
      </button>
      <span aria-live="polite" className="min-w-6 text-center text-sm font-bold">
        {qty}
      </span>
      <button
        type="button"
        onClick={add}
        aria-label={`Add one more ${product.name}`}
        className="grid size-7 place-items-center rounded-lg transition active:scale-90 hover:bg-primary-foreground/15"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const wishlist = useWishlist();
  const [burst, setBurst] = useState(false);
  const liked = wishlist.includes(product.id);
  const off = discountPct(product.price, product.mrp);

  return (
    <article className="group relative flex h-full w-[164px] shrink-0 flex-col gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:w-[184px]">
      {off > 0 && (
        <span className="absolute -left-1 top-3 z-10 rounded-r-md bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-accent-foreground">
          {off}% OFF
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          toggleWishlist(product.id);
          setBurst(true);
          setTimeout(() => setBurst(false), 500);
        }}
        aria-pressed={liked}
        aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
        className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-surface/90 shadow-soft transition active:scale-90"
      >
        <Heart
          className={cn("size-4", liked ? "fill-destructive text-destructive" : "text-muted-foreground")}
        />
        {burst && liked && (
          <span className="animate-burst pointer-events-none absolute inset-0 rounded-full border-2 border-destructive" />
        )}
      </button>

      <button
        type="button"
        onClick={() => openProduct(product.id)}
        className="text-left"
        aria-label={`View details for ${product.name}`}
      >
        <ProductArt product={product} className="aspect-square w-full" />
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Clock3 className="size-3" /> {product.eta} mins
          <span className="ml-auto inline-flex items-center gap-0.5 text-foreground">
            <Star className="size-3 fill-accent text-accent" />
            {product.rating}
          </span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.unit}</p>
      </button>

      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <div className="min-w-0">
          <p className="text-sm font-extrabold">{inr(product.price)}</p>
          {off > 0 && (
            <p className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</p>
          )}
        </div>
        <div className="w-[76px] shrink-0">
          <QtyStepper product={product} />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="w-[164px] shrink-0 rounded-2xl border border-border bg-card p-2.5 sm:w-[184px]">
      <div className="skeleton-shimmer aspect-square w-full rounded-2xl" />
      <div className="skeleton-shimmer mt-3 h-3 w-4/5 rounded-full" />
      <div className="skeleton-shimmer mt-2 h-3 w-1/2 rounded-full" />
      <div className="skeleton-shimmer mt-4 h-7 w-full rounded-xl" />
    </div>
  );
}
