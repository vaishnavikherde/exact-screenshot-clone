import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CATEGORIES } from "@/lib/catalog";
import { searchProducts, type SearchFilters } from "@/lib/search";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

const schema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  sort: z.enum(["relevance", "price-asc", "price-desc", "rating", "discount"]).optional().catch(undefined),
  diet: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/search")({
  validateSearch: schema,
  head: () => ({
    meta: [
      { title: "Search groceries — FreshMind" },
      { name: "description", content: "Find fruits, dairy, snacks and daily essentials with smart, typo-tolerant search." },
      { property: "og:title", content: "Search groceries — FreshMind" },
      { property: "og:description", content: "Find fruits, dairy, snacks and daily essentials with smart, typo-tolerant search." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const filters: SearchFilters = { category: s.category ?? null, diet: s.diet ?? null, sort: s.sort ?? "relevance" };
  const results = searchProducts(s.q ?? "", filters);
  const set = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-extrabold">
        {s.q ? <>Results for “{s.q}”</> : s.category ?? "All products"}
      </h1>
      <p className="text-sm text-muted-foreground">{results.length} items · Delivery in 10 mins</p>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2">
        <Chip active={!s.category} onClick={() => set({ category: undefined })}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.name} active={s.category === c.name} onClick={() => set({ category: c.name })}>{c.emoji} {c.name}</Chip>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {["veg", "vegan", "high-protein", "keto"].map((d) => (
          <Chip key={d} active={s.diet === d} onClick={() => set({ diet: s.diet === d ? undefined : d })}>{d}</Chip>
        ))}
        <select
          aria-label="Sort"
          value={s.sort ?? "relevance"}
          onChange={(e) => set({ sort: e.target.value as SearchFilters["sort"] & string })}
          className="ml-auto rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-semibold"
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="discount">Biggest discount</option>
        </select>
      </div>

      {results.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-3 font-bold">No matches yet</p>
          <p className="text-sm text-muted-foreground">Try “milk”, “paneer” or “chips”.</p>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold capitalize", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
      {children}
    </button>
  );
}
