/** Ephemeral UI state (overlays + theme). Theme is persisted. */
import { createStore, useStore } from "./store";

type UIState = {
  cartOpen: boolean;
  authOpen: boolean;
  locationOpen: boolean;
  aiOpen: boolean;
  sheetProductId: string | null;
  theme: "light" | "dark";
};

export const uiStore = createStore<UIState>(
  {
    cartOpen: false,
    authOpen: false,
    locationOpen: false,
    aiOpen: false,
    sheetProductId: null,
    theme: "light",
  },
  "freshmind.ui.v1",
);

export const openCart = () => uiStore.set((s) => ({ ...s, cartOpen: true }));
export const closeCart = () => uiStore.set((s) => ({ ...s, cartOpen: false }));
export const setCartOpen = (cartOpen: boolean) => uiStore.set((s) => ({ ...s, cartOpen }));
export const setAuthOpen = (authOpen: boolean) => uiStore.set((s) => ({ ...s, authOpen }));
export const setLocationOpen = (locationOpen: boolean) =>
  uiStore.set((s) => ({ ...s, locationOpen }));
export const setAIOpen = (aiOpen: boolean) => uiStore.set((s) => ({ ...s, aiOpen }));
export const openProduct = (id: string | null) => uiStore.set((s) => ({ ...s, sheetProductId: id }));

export function toggleTheme() {
  uiStore.set((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
}

export function useUI<S>(selector: (s: UIState) => S) {
  return useStore(uiStore, selector);
}
