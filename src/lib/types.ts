/** Shared domain types for FreshMind. */

export type Product = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  /** Selling price in INR for the default unit. */
  price: number;
  /** Strikethrough MRP in INR. */
  mrp: number;
  unit: string;
  /** Alternate pack sizes with their own price. */
  variants?: { unit: string; price: number; mrp: number }[];
  emoji: string;
  /** Pastel tint token used behind the product art. */
  tint: string;
  rating: number;
  eta: number;
  diet: ("veg" | "vegan" | "high-protein" | "keto")[];
  description: string;
  nutrition: { energy: string; protein: string; carbs: string; fat: string };
  maxQty: number;
};

export type CartLine = {
  productId: string;
  unit: string;
  qty: number;
};

export type Address = {
  id: string;
  label: string;
  line: string;
  city: string;
  pin: string;
};

export type Order = {
  id: string;
  placedAt: number;
  total: number;
  items: { name: string; qty: number; emoji: string }[];
};
