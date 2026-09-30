/**
 * Tiny framework-agnostic pub/sub store with optional localStorage persistence.
 * Kept dependency-free so the logic layer stays portable.
 */
import { useRef, useSyncExternalStore } from "react";

export type Store<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
};

export function createStore<T>(initial: T, persistKey?: string): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  let hydrated = false;

  const hydrate = () => {
    if (hydrated || !persistKey || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(persistKey);
      if (raw) {
        state = { ...(state as object), ...JSON.parse(raw) } as T;
        listeners.forEach((l) => l());
      }
    } catch {
      /* ignore malformed storage */
    }
  };

  return {
    get: () => state,
    set: (next) => {
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      if (persistKey && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(persistKey, JSON.stringify(state));
        } catch {
          /* quota or private mode */
        }
      }
      listeners.forEach((l) => l());
    },
    subscribe: (fn) => {
      hydrate();
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/**
 * React binding. The selection is cached per state snapshot so selectors that
 * build new objects/arrays don't trigger infinite re-render loops.
 */
export function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  const cache = useRef<{ state: T; value: S } | null>(null);
  const selRef = useRef(selector);
  selRef.current = selector;
  const getSnapshot = () => {
    const state = store.get();
    if (cache.current && cache.current.state === state) return cache.current.value;
    const value = selRef.current(state);
    cache.current = { state, value };
    return value;
  };
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
