import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function ProductRow({
  title,
  subtitle,
  products,
  seeAllQuery,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  seeAllQuery?: string;
}) {
  if (!products.length) return null;
  return (
    <Reveal as="section" className="mx-auto w-full max-w-7xl px-4 py-4">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold sm:text-xl">{title}</h2>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {seeAllQuery !== undefined && (
          <Link
            to="/search"
            search={{ q: seeAllQuery }}
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-bold text-primary hover:underline"
          >
            See all <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {products.map((p) => (
          <div key={p.id} className="snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </Reveal>
  );
}
