/** Typo-tolerant fuzzy search over name, category and tags. */
import { allProducts } from "./catalog";
import type { Product } from "./types";

export const TRENDING = ["milk", "paneer", "bananas", "chips", "eggs", "coffee", "bread", "curd"];

/** Bounded Levenshtein distance — good enough for single-word typos. */
function distance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function scoreProduct(p: Product, q: string) {
  const name = p.name.toLowerCase();
  const haystack = [name, p.category.toLowerCase(), ...p.tags].join(" ");
  if (name.startsWith(q)) return 100;
  if (name.includes(q)) return 80;
  if (p.tags.some((t) => t === q)) return 70;
  if (haystack.includes(q)) return 55;
  const words = haystack.split(/\s+/);
  const best = Math.min(...words.map((w) => distance(w, q)));
  if (best <= 1) return 40;
  if (best === 2 && q.length >= 5) return 25;
  return 0;
}

export type SearchFilters = {
  maxPrice?: number;
  diet?: string | null;
  category?: string | null;
  minRating?: number;
  sort?: "relevance" | "price-asc" | "price-desc" | "rating" | "discount";
};

export function searchProducts(query: string, filters: SearchFilters = {}): Product[] {
  const q = query.trim().toLowerCase();
  let results: { p: Product; score: number }[];

  if (!q) {
    results = allProducts().map((p) => ({ p, score: 1 }));
  } else {
    const terms = q.split(/\s+/);
    results = allProducts()
      .map((p) => ({ p, score: terms.reduce((n, t) => n + scoreProduct(p, t), 0) }))
      .filter((r) => r.score > 0);
  }

  let list = results
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p)
    .filter((p) => (filters.maxPrice ? p.price <= filters.maxPrice : true))
    .filter((p) => (filters.diet ? p.diet.includes(filters.diet as never) : true))
    .filter((p) => (filters.category ? p.category === filters.category : true))
    .filter((p) => (filters.minRating ? p.rating >= filters.minRating : true));

  switch (filters.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list = [...list].sort((a, b) => b.rating - a.rating);
      break;
    case "discount":
      list = [...list].sort(
        (a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp,
      );
      break;
    default:
      break;
  }
  return list;
}

/** Split a label into matched/unmatched chunks for highlighting. */
export function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return [{ text, match: false }];
  return [
    { text: text.slice(0, i), match: false },
    { text: text.slice(i, i + q.length), match: true },
    { text: text.slice(i + q.length), match: false },
  ].filter((c) => c.text.length > 0);
}
