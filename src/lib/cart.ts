/** Cart, wishlist and session state. Persisted in localStorage via the pub/sub store. */
import { createStore, useStore } from "./store";
import { getProduct } from "./catalog";
import type { Address, CartLine, Order, Product } from "./types";

export const FREE_DELIVERY_THRESHOLD = 199;
export const DELIVERY_FEE = 29;
export const HANDLING_FEE = 9;

type AppState = {
  lines: CartLine[];
  wishlist: string[];
  recent: string[];
  orders: Order[];
  addresses: Address[];
  coupon: string | null;
  pin: string;
  loggedInPhone: string | null;
};

const initial: AppState = {
  lines: [],
  wishlist: [],
  recent: [],
  orders: [],
  addresses: [
    { id: "a1", label: "Home", line: "12, Lotus Residency, Hiranandani", city: "Mumbai", pin: "400076" },
  ],
  coupon: null,
  pin: "400076",
  loggedInPhone: null,
};

export const appStore = createStore<AppState>(initial, "freshmind.state.v1");

export const COUPONS: Record<string, { off: number; label: string }> = {
  FRESH50: { off: 50, label: "₹50 off your order" },
  MIND10: { off: 30, label: "₹30 instant discount" },
};

const key = (productId: string, unit: string) => `${productId}__${unit}`;

export function lineQty(productId: string, unit?: string) {
  const { lines } = appStore.get();
  return lines
    .filter((l) => l.productId === productId && (!unit || l.unit === unit))
    .reduce((n, l) => n + l.qty, 0);
}

export function addToCart(product: Product, unit = product.unit, qty = 1) {
  appStore.set((s) => {
    const existing = s.lines.find((l) => key(l.productId, l.unit) === key(product.id, unit));
    const nextQty = Math.min(product.maxQty, (existing?.qty ?? 0) + qty);
    const lines = existing
      ? s.lines.map((l) =>
          key(l.productId, l.unit) === key(product.id, unit) ? { ...l, qty: nextQty } : l,
        )
      : [...s.lines, { productId: product.id, unit, qty: nextQty }];
    return { ...s, lines };
  });
}

export function setQty(productId: string, unit: string, qty: number) {
  appStore.set((s) => ({
    ...s,
    lines:
      qty <= 0
        ? s.lines.filter((l) => key(l.productId, l.unit) !== key(productId, unit))
        : s.lines.map((l) =>
            key(l.productId, l.unit) === key(productId, unit) ? { ...l, qty } : l,
          ),
  }));
}

export function removeLine(productId: string, unit: string) {
  setQty(productId, unit, 0);
}

export function clearCart() {
  appStore.set((s) => ({ ...s, lines: [], coupon: null }));
}

export function toggleWishlist(productId: string) {
  appStore.set((s) => ({
    ...s,
    wishlist: s.wishlist.includes(productId)
      ? s.wishlist.filter((id) => id !== productId)
      : [...s.wishlist, productId],
  }));
}

export function rememberSearch(term: string) {
  const t = term.trim();
  if (!t) return;
  appStore.set((s) => ({ ...s, recent: [t, ...s.recent.filter((r) => r !== t)].slice(0, 6) }));
}

export function applyCoupon(code: string) {
  const up = code.trim().toUpperCase();
  if (!COUPONS[up]) return false;
  appStore.set((s) => ({ ...s, coupon: up }));
  return true;
}

export function setPin(pin: string) {
  appStore.set((s) => ({ ...s, pin }));
}

export function login(phone: string) {
  appStore.set((s) => ({ ...s, loggedInPhone: phone }));
}

export function addAddress(a: Omit<Address, "id">) {
  const id = `a${Date.now()}`;
  appStore.set((s) => ({ ...s, addresses: [...s.addresses, { ...a, id }] }));
  return id;
}

export function placeOrder(): Order {
  const { items, total } = cartSummary();
  const order: Order = {
    id: `FM${Math.floor(100000 + Math.random() * 899999)}`,
    placedAt: Date.now(),
    total,
    items: items.map((i) => ({ name: i.product.name, qty: i.line.qty, emoji: i.product.emoji })),
  };
  appStore.set((s) => ({ ...s, orders: [order, ...s.orders], lines: [], coupon: null }));
  return order;
}

export type CartItem = { line: CartLine; product: Product; price: number; mrp: number };

export function cartItems(): CartItem[] {
  return appStore
    .get()
    .lines.map((line) => {
      const product = getProduct(line.productId);
      if (!product) return null;
      const variant = product.variants?.find((v) => v.unit === line.unit);
      return {
        line,
        product,
        price: variant?.price ?? product.price,
        mrp: variant?.mrp ?? product.mrp,
      };
    })
    .filter(Boolean) as CartItem[];
}

export function cartSummary() {
  const items = cartItems();
  const itemTotal = items.reduce((n, i) => n + i.price * i.line.qty, 0);
  const mrpTotal = items.reduce((n, i) => n + i.mrp * i.line.qty, 0);
  const count = items.reduce((n, i) => n + i.line.qty, 0);
  const coupon = appStore.get().coupon;
  const couponOff = coupon && itemTotal > 0 ? Math.min(COUPONS[coupon]?.off ?? 0, itemTotal) : 0;
  const delivery = itemTotal === 0 || itemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const handling = itemTotal === 0 ? 0 : HANDLING_FEE;
  const gst = Math.round((itemTotal - couponOff) * 0.05);
  const total = Math.max(0, itemTotal - couponOff + delivery + handling + gst);
  return {
    items,
    count,
    itemTotal,
    mrpTotal,
    couponOff,
    delivery,
    handling,
    gst,
    total,
    savings: mrpTotal - itemTotal + couponOff,
    toFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - itemTotal),
  };
}

/* ---- React hooks ---- */

export function useCartSummary() {
  return useStore(appStore, () => cartSummary());
}

export function useCartCount() {
  return useStore(appStore, (s) => s.lines.reduce((n, l) => n + l.qty, 0));
}

export function useQty(productId: string, unit?: string) {
  return useStore(appStore, (s) =>
    s.lines
      .filter((l) => l.productId === productId && (!unit || l.unit === unit))
      .reduce((n, l) => n + l.qty, 0),
  );
}

export function useWishlist() {
  return useStore(appStore, (s) => s.wishlist);
}

export function useAppState<S>(selector: (s: AppState) => S) {
  return useStore(appStore, selector);
}
