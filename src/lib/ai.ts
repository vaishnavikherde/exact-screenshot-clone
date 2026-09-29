/**
 * Mock AI engine. Intent + keyword matching over the catalogue.
 * `askAI` is async so it can later be swapped for a real LLM call.
 */
import { allProducts, getProduct } from "./catalog";
import { searchProducts } from "./search";
import { appStore } from "./cart";
import type { Product } from "./types";
import { sleep } from "./utils";

export type AIItem = { product: Product; qty: number; note?: string };
export type AIAnswer = { reply: string; items: AIItem[]; title?: string };

export type Recipe = {
  id: string;
  name: string;
  emoji: string;
  serves: number;
  minutes: number;
  keywords: string[];
  /** Ingredient search terms resolved against the catalogue. */
  ingredients: { term: string; qty: number }[];
};

export const RECIPES: Recipe[] = [
  {
    id: "pasta",
    name: "Creamy Arrabbiata Pasta",
    emoji: "🍝",
    serves: 4,
    minutes: 25,
    keywords: ["pasta", "italian", "arrabbiata", "spaghetti"],
    ingredients: [
      { term: "pasta", qty: 1 },
      { term: "pasta sauce", qty: 1 },
      { term: "capsicum", qty: 1 },
      { term: "cheese", qty: 1 },
      { term: "butter", qty: 1 },
    ],
  },
  {
    id: "paneer",
    name: "Paneer Butter Masala",
    emoji: "🍛",
    serves: 4,
    minutes: 35,
    keywords: ["paneer", "curry", "indian", "butter masala", "dinner"],
    ingredients: [
      { term: "paneer", qty: 2 },
      { term: "tomato", qty: 1 },
      { term: "onion", qty: 1 },
      { term: "butter", qty: 1 },
      { term: "garam masala", qty: 1 },
    ],
  },
  {
    id: "breakfast",
    name: "High-Protein Breakfast",
    emoji: "🍳",
    serves: 2,
    minutes: 15,
    keywords: ["breakfast", "protein", "eggs", "morning", "healthy"],
    ingredients: [
      { term: "eggs", qty: 1 },
      { term: "bread", qty: 1 },
      { term: "greek yogurt", qty: 1 },
      { term: "banana", qty: 1 },
      { term: "peanut butter", qty: 1 },
    ],
  },
  {
    id: "salad",
    name: "Crunchy Detox Salad",
    emoji: "🥗",
    serves: 2,
    minutes: 10,
    keywords: ["salad", "healthy", "detox", "light", "keto"],
    ingredients: [
      { term: "cucumber", qty: 1 },
      { term: "carrot", qty: 1 },
      { term: "avocado", qty: 1 },
      { term: "lemon", qty: 1 },
      { term: "spinach", qty: 1 },
    ],
  },
  {
    id: "chai",
    name: "Rainy Day Chai & Snacks",
    emoji: "☕",
    serves: 4,
    minutes: 12,
    keywords: ["chai", "tea", "snacks", "evening", "namkeen"],
    ingredients: [
      { term: "tea", qty: 1 },
      { term: "milk", qty: 2 },
      { term: "namkeen", qty: 1 },
      { term: "biscuits", qty: 1 },
    ],
  },
  {
    id: "party",
    name: "Movie Night Party Box",
    emoji: "🍿",
    serves: 6,
    minutes: 5,
    keywords: ["party", "movie", "friends", "snacks", "cola"],
    ingredients: [
      { term: "popcorn", qty: 2 },
      { term: "nachos", qty: 1 },
      { term: "cola", qty: 4 },
      { term: "chips", qty: 2 },
      { term: "ice cream", qty: 1 },
    ],
  },
];

function resolve(term: string): Product | undefined {
  return searchProducts(term)[0];
}

export function recipeItems(recipe: Recipe, servesMultiplier = 1): AIItem[] {
  return recipe.ingredients
    .map(({ term, qty }) => {
      const product = resolve(term);
      return product ? { product, qty: Math.max(1, Math.round(qty * servesMultiplier)) } : null;
    })
    .filter((p): p is Product => Boolean(p)) as AIItem[];
}

const numberFrom = (text: string, fallback: number) => {
  const m = text.match(/(\d+)\s*(people|person|serving|pax|guests)/);
  return m ? Number(m[1]) : fallback;
};

const budgetFrom = (text: string) => {
  const m = text.match(/(?:under|below|within)\s*(?:₹|rs\.?\s?)?(\d{2,5})/i);
  return m ? Number(m[1]) : null;
};

/** Main entry point — replace the body with a real LLM call when ready. */
export async function askAI(prompt: string): Promise<AIAnswer> {
  await sleep(500);
  const text = prompt.toLowerCase();
  const budget = budgetFrom(text);

  const recipe = RECIPES.find((r) => r.keywords.some((k) => text.includes(k)));
  if (recipe) {
    const serves = numberFrom(text, recipe.serves);
    const items = recipeItems(recipe, serves / recipe.serves);
    const trimmed = budget ? fitBudget(items, budget) : items;
    return {
      title: recipe.name,
      reply: `${recipe.emoji} ${recipe.name} for ${serves} — ready in about ${recipe.minutes} minutes. I've put together ${trimmed.length} items${budget ? ` under ₹${budget}` : ""}. Want them in your cart?`,
      items: trimmed,
    };
  }

  if (/(week|weekly|basket|month|essentials|stock up)/.test(text)) {
    const items = smartBasket({ budget: budget ?? 1200, diet: dietFrom(text) });
    return {
      title: "Weekly Smart Basket",
      reply: `Here's a balanced weekly basket${budget ? ` under ₹${budget}` : ""} — staples, fresh produce and a couple of treats.`,
      items,
    };
  }

  if (/(healthy|diet|low cal|fitness|protein)/.test(text)) {
    const items = smartBasket({ budget: budget ?? 800, diet: "high-protein" }).slice(0, 6);
    return {
      title: "Healthy picks",
      reply: `Protein-forward picks${budget ? ` under ₹${budget}` : ""} to keep you full through the day.`,
      items,
    };
  }

  const found = searchProducts(prompt).slice(0, 6);
  if (found.length) {
    return {
      reply: `I found ${found.length} matches for "${prompt.trim()}". Tap add on any of them, or add them all together.`,
      items: found.map((product) => ({ product, qty: 1 })),
    };
  }

  return {
    reply:
      "I couldn't match that yet. Try something like \"pasta for 4 people\", \"healthy breakfast under ₹300\" or \"weekly basket for 2\".",
    items: [],
  };
}

function dietFrom(text: string): BasketDiet {
  if (text.includes("vegan")) return "vegan";
  if (text.includes("keto")) return "keto";
  if (text.includes("protein")) return "high-protein";
  return "veg";
}

function fitBudget(items: AIItem[], budget: number) {
  const out: AIItem[] = [];
  let spent = 0;
  for (const item of items) {
    const cost = item.product.price * item.qty;
    if (spent + cost > budget) continue;
    spent += cost;
    out.push(item);
  }
  return out.length ? out : items.slice(0, 2);
}

export type BasketDiet = "veg" | "vegan" | "high-protein" | "keto";

/** Weekly basket generator driven by a budget slider + diet filter. */
export function smartBasket({ budget, diet }: { budget: number; diet: BasketDiet }): AIItem[] {
  const pool = allProducts()
    .filter((p) => p.diet.includes(diet))
    .filter((p) => !["Pet Care", "Baby Care", "Cleaning"].includes(p.category));

  const wanted = ["Staples", "Dairy & Eggs", "Fruits & Vegetables", "Bakery", "Beverages", "Snacks"];
  const picks: Product[] = [];
  let round = 0;
  while (round < 4) {
    for (const cat of wanted) {
      const next = pool.find((p) => p.category === cat && !picks.includes(p));
      if (next) picks.push(next);
    }
    round++;
  }

  const items: AIItem[] = [];
  let spent = 0;
  for (const product of picks) {
    if (spent + product.price > budget) continue;
    spent += product.price;
    items.push({ product, qty: 1 });
    if (items.length >= 12) break;
  }
  return items;
}

/** Mock personalisation from cart + order history. */
export function recommended(): Product[] {
  const { lines, orders } = appStore.get();
  const seedCats = new Set(
    lines.map((l) => getProduct(l.productId)?.category).filter((p): p is Product => Boolean(p)) as string[],
  );
  const inCart = new Set(lines.map((l) => l.productId));
  const pool = allProducts().filter((p) => !inCart.has(p.id));
  const affinity = pool.filter((p) => seedCats.has(p.category));
  const rest = pool.filter((p) => !seedCats.has(p.category) && p.rating >= 4.4);
  const seen = new Set(orders.flatMap((o) => o.items.map((i) => i.name)));
  return [...affinity, ...rest].filter((p) => !seen.has(p.name)).slice(0, 12);
}

/** "Buy it again" strip from past orders, with a sensible fallback. */
export function buyItAgain(): Product[] {
  const { orders } = appStore.get();
  const names = orders.flatMap((o) => o.items.map((i) => i.name));
  const fromHistory = allProducts().filter((p) => names.includes(p.name));
  if (fromHistory.length) return fromHistory.slice(0, 12);
  return ["milk", "eggs", "bread", "banana", "curd", "tea", "atta", "onion"]
    .map((t) => searchProducts(t)[0])
    .filter((p): p is Product => Boolean(p))
    .slice(0, 8);
}

/** Cart-aware nudge for the drawer ("you might have forgotten..."). */
export function forgottenSuggestion(): Product | null {
  const inCart = new Set(appStore.get().lines.map((l) => l.productId));
  if (inCart.size === 0) return null;
  const staples = ["eggs", "milk", "bread", "curd", "onion", "salt"];
  for (const term of staples) {
    const p = searchProducts(term)[0];
    if (p && !inCart.has(p.id)) return p;
  }
  return null;
}

/** "Frequently bought together" for the product sheet. */
export function frequentlyBoughtWith(product: Product): Product[] {
  return allProducts()
    .filter((p) => p.id !== product.id && (p.category === product.category || p.tags.some((t) => product.tags.includes(t))))
    .slice(0, 3);
}

export function similarProducts(product: Product): Product[] {
  return allProducts()
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 8);
}
