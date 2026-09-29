/**
 * Async service layer over the mock catalogue.
 * Swap the body of these functions for real API calls later — callers stay unchanged.
 */
import raw from "@/data/products.json";
import type { Product } from "./types";
import { sleep } from "./utils";

const PRODUCTS = raw as unknown as Product[];

export const CATEGORIES = [
  { name: "Fruits & Vegetables", emoji: "🥬", tint: "emerald" },
  { name: "Dairy & Eggs", emoji: "🥛", tint: "sky" },
  { name: "Snacks", emoji: "🍿", tint: "amber" },
  { name: "Beverages", emoji: "🥤", tint: "rose" },
  { name: "Staples", emoji: "🍚", tint: "stone" },
  { name: "Bakery", emoji: "🥐", tint: "amber" },
  { name: "Personal Care", emoji: "🧴", tint: "sky" },
  { name: "Cleaning", emoji: "🧼", tint: "emerald" },
  { name: "Baby Care", emoji: "👶", tint: "rose" },
  { name: "Pet Care", emoji: "🐶", tint: "amber" },
  { name: "Pharmacy", emoji: "💊", tint: "sky" },
  { name: "Frozen", emoji: "🍨", tint: "stone" },
  { name: "Breakfast", emoji: "🥣", tint: "amber" },
  { name: "Sweet Tooth", emoji: "🍫", tint: "rose" },
  { name: "Home Needs", emoji: "🏠", tint: "emerald" },
  { name: "Party Picks", emoji: "🎉", tint: "amber" },
];

/** Pastel background per tint token (kept here so cards stay token-driven). */
export const TINTS: Record<string, string> = {
  emerald: "bg-[color-mix(in_oklab,var(--primary)_14%,var(--surface))]",
  amber: "bg-[color-mix(in_oklab,var(--accent)_22%,var(--surface))]",
  rose: "bg-[color-mix(in_oklab,var(--destructive)_12%,var(--surface))]",
  sky: "bg-[color-mix(in_oklab,var(--chart-5)_16%,var(--surface))]",
  stone: "bg-[color-mix(in_oklab,var(--muted-foreground)_12%,var(--surface))]",
};

export async function fetchProducts(): Promise<Product[]> {
  await sleep(120); // simulates network latency for skeleton states
  return PRODUCTS;
}

export function allProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function byCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

/** Named merchandising rows on the home page. */
export function collection(key: string): Product[] {
  switch (key) {
    case "bestsellers":
      return PRODUCTS.filter((p) => p.rating >= 4.5).slice(0, 12);
    case "vegetables":
      return byCategory("Fruits & Vegetables").slice(0, 12);
    case "dairy":
      return byCategory("Dairy & Eggs");
    case "snacks":
      return byCategory("Snacks");
    default:
      return PRODUCTS.slice(0, 12);
  }
}
