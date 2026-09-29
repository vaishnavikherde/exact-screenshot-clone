import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format paise-free INR amounts, e.g. 1299 -> "₹1,299". */
export function inr(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function discountPct(price: number, mrp: number) {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms = 250) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
