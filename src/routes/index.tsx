import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, TINTS, collection, fetchProducts } from "@/lib/catalog";
import { RECIPES, buyItAgain, recipeItems, recommended, smartBasket, type BasketDiet } from "@/lib/ai";
import { addToCart } from "@/lib/cart";
import { inr, cn } from "@/lib/utils";
import { ProductRow } from "@/components/ProductRow";
import { ProductCardSkeleton } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FreshMind — Groceries delivered in 10 minutes" },
      { name: "description", content: "Shop fresh fruits, dairy, snacks and essentials with AI-built baskets. Delivered in 10 minutes." },
      { property: "og:title", content: "FreshMind — Groceries delivered in 10 minutes" },
      { property: "og:description", content: "Shop fresh fruits, dairy, snacks and essentials with AI-built baskets. Delivered in 10 minutes." },
    ],
  }),
  component: Home,
});

const BANNERS = [
  { title: "Farm-fresh in 10 mins", sub: "Up to 40% off fruits & veggies", cta: "vegetables", emoji: "🥑" },
  { title: "Breakfast, sorted", sub: "Milk, bread, eggs from ₹29", cta: "breakfast", emoji: "🥞" },
  { title: "Snack attack?", sub: "Buy 2 get 1 on chips & dips", cta: "chips", emoji: "🍿" },
];

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fetchProducts().then(() => setReady(true));
  }, []);

  return (
    <div className="pb-16">
      <Hero />
      <Categories />
      {ready ? (
        <>
          <ProductRow title="Buy it again" subtitle="Your usuals, one tap away" products={buyItAgain()} seeAllQuery="" />
          <ProductRow title="Bestsellers" subtitle="Fresh picks for you" products={collection("bestsellers")} seeAllQuery="" />
          <SmartBasket />
          <ProductRow title="Recommended for you" subtitle="Picked by FreshMind AI" products={recommended()} seeAllQuery="" />
          <RecipeToCart />
        </>
      ) : (
        <div className="mx-auto flex max-w-7xl gap-3 overflow-hidden px-4 py-6">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);
  const b = BANNERS[i]!;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4" aria-roledescription="carousel" aria-label="Offers">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--primary)_60%,var(--accent))] p-6 text-primary-foreground sm:p-10">
        <div key={i} className="animate-in fade-in slide-in-from-right-4 flex items-center justify-between gap-4 duration-500">
          <div className="max-w-md">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Delivering in 9 mins</span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{b.title}</h1>
            <p className="mt-2 text-sm opacity-90 sm:text-base">{b.sub}</p>
            <Link to="/search" search={{ q: b.cta }} className="mt-5 inline-flex rounded-xl bg-background px-5 py-2.5 text-sm font-bold text-foreground active:scale-95">
              Shop now
            </Link>
          </div>
          <span className="hidden text-8xl sm:block sm:text-9xl" aria-hidden>{b.emoji}</span>
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button aria-label="Previous offer" onClick={() => setI((n) => (n + BANNERS.length - 1) % BANNERS.length)} className="rounded-full bg-background/20 p-1.5 hover:bg-background/30"><ChevronLeft className="size-4" /></button>
          <button aria-label="Next offer" onClick={() => setI((n) => (n + 1) % BANNERS.length)} className="rounded-full bg-background/20 p-1.5 hover:bg-background/30"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="mb-3 text-lg font-extrabold sm:text-xl">Shop by category</h2>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {CATEGORIES.map((c) => (
          <Link key={c.name} to="/search" search={{ category: c.name }} className="group flex flex-col items-center gap-1.5 text-center">
            <span className={cn("grid aspect-square w-full place-items-center rounded-2xl text-3xl transition-transform group-hover:scale-105", TINTS[c.tint])}>{c.emoji}</span>
            <span className="text-[11px] font-semibold leading-tight">{c.name}</span>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}

function SmartBasket() {
  const [budget, setBudget] = useState(500);
  const [diet, setDiet] = useState<BasketDiet>("veg");
  const items = smartBasket({ budget, diet });
  const total = items.reduce((n, i) => n + i.product.price * i.qty, 0);
  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-4 py-6">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2"><Sparkles className="size-5 text-primary" /><h2 className="text-lg font-extrabold sm:text-xl">Smart basket</h2></div>
        <p className="text-sm text-muted-foreground">Set a budget and diet — AI fills your week.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-3 text-sm font-semibold">
            Budget {inr(budget)}
            <input type="range" min={200} max={2000} step={50} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="accent-[var(--primary)]" />
          </label>
          <div className="flex flex-wrap gap-2">
            {(["veg", "vegan", "high-protein", "keto"] as BasketDiet[]).map((d) => (
              <button key={d} onClick={() => setDiet(d)} className={cn("rounded-full border px-3 py-1 text-xs font-bold capitalize", diet === d ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{d}</button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((i) => (
            <span key={i.product.id} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{i.product.emoji} {i.product.name} ×{i.qty}</span>
          ))}
        </div>
        <button
          disabled={!items.length}
          onClick={() => { items.forEach((i) => addToCart(i.product, i.product.unit, i.qty)); toast.success(`Added ${items.length} items to cart`); }}
          className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground active:scale-95 disabled:opacity-50"
        >
          Add basket · {inr(total)}
        </button>
      </div>
    </Reveal>
  );
}

function RecipeToCart() {
  return (
    <Reveal as="section" className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-3 flex items-center gap-2"><Wand2 className="size-5 text-primary" /><h2 className="text-lg font-extrabold sm:text-xl">Recipe to cart</h2></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {RECIPES.slice(0, 8).map((r) => (
          <button
            key={r.name}
            onClick={() => { const items = recipeItems(r); items.forEach((i) => addToCart(i.product, i.product.unit, i.qty)); toast.success(`${r.name}: ${items.length} ingredients added`); }}
            className="rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden>{r.emoji}</span>
            <p className="mt-2 text-sm font-bold">{r.name}</p>
            <p className="text-xs text-primary font-semibold">Add ingredients →</p>
          </button>
        ))}
      </div>
    </Reveal>
  );
}
