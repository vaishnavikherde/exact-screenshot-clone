import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Check } from "lucide-react";
import { useAppState } from "@/lib/cart";
import { cn, inr } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  validateSearch: z.object({ id: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Track your order — FreshMind" },
      { name: "description", content: "Follow your FreshMind order live, from packing to your doorstep." },
      { property: "og:title", content: "Track your order — FreshMind" },
      { property: "og:description", content: "Follow your FreshMind order live, from packing to your doorstep." },
    ],
  }),
  component: Track,
});

const STEPS = ["Order confirmed", "Packing your items", "Out for delivery", "Delivered"];

function Track() {
  const { id } = Route.useSearch();
  const orders = useAppState((s) => s.orders);
  const order = orders.find((o) => o.id === id) ?? orders[0];
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 3000);
    return () => clearInterval(t);
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-5xl">📦</p>
        <h1 className="mt-3 text-xl font-extrabold">No orders yet</h1>
        <Link to="/" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Start shopping</Link>
      </div>
    );
  }

  const elapsed = now ? (now - order.placedAt) / 1000 : 0;
  const step = Math.min(3, Math.floor(elapsed / 20));
  const mins = Math.max(0, 10 - Math.floor(elapsed / 60));

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--primary)_60%,var(--accent))] p-6 text-primary-foreground">
        <p className="text-sm opacity-90">Order #{order.id}</p>
        <h1 className="mt-1 text-3xl font-extrabold">{step === 3 ? "Delivered 🎉" : `Arriving in ${mins} mins`}</h1>
      </div>
      <ol className="rounded-2xl border border-border bg-card p-5">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-3 py-2">
            <span className={cn("grid size-7 place-items-center rounded-full border-2", i <= step ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
              {i <= step && <Check className="size-4" />}
            </span>
            <span className={cn("text-sm font-semibold", i > step && "text-muted-foreground")}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-bold">Items</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {order.items.map((it) => <li key={it.name}>{it.emoji} {it.name} × {it.qty}</li>)}
        </ul>
        <p className="mt-3 border-t border-border pt-2 text-sm font-extrabold">Paid {inr(order.total)}</p>
      </div>
      {orders.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold">Past orders</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {orders.map((o) => (
              <li key={o.id}><Link to="/track" search={{ id: o.id }} className="hover:underline">#{o.id} · {inr(o.total)} · {o.items.length} items</Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
