import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { placeOrder, useAppState, useCartSummary } from "@/lib/cart";
import { cn, inr } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — FreshMind" },
      { name: "description", content: "Choose your address, delivery slot and payment to place your FreshMind order." },
      { property: "og:title", content: "Checkout — FreshMind" },
      { property: "og:description", content: "Choose your address, delivery slot and payment to place your FreshMind order." },
    ],
  }),
  component: Checkout,
});

const SLOTS = ["Now · 10 mins", "Today 6–7 PM", "Today 8–9 PM", "Tomorrow 7–8 AM"];
const PAYMENTS = ["UPI", "Card", "Cash on delivery"];

function Checkout() {
  const sum = useCartSummary();
  const addresses = useAppState((s) => s.addresses);
  const [addr, setAddr] = useState(addresses[0]?.id ?? "");
  const [slot, setSlot] = useState(SLOTS[0]!);
  const [pay, setPay] = useState(PAYMENTS[0]!);
  const navigate = useNavigate();

  if (!sum.items.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-3 text-xl font-extrabold">Your cart is empty</h1>
        <Link to="/" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold">Checkout</h1>
        <Section title="Delivery address">
          {addresses.map((a) => (
            <Option key={a.id} active={addr === a.id} onClick={() => setAddr(a.id)}>
              <span className="font-bold">{a.label}</span> · {a.line}, {a.city} {a.pin}
            </Option>
          ))}
        </Section>
        <Section title="Delivery slot">
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map((s) => <Option key={s} active={slot === s} onClick={() => setSlot(s)}>{s}</Option>)}
          </div>
        </Section>
        <Section title="Payment">
          <div className="grid grid-cols-3 gap-2">
            {PAYMENTS.map((p) => <Option key={p} active={pay === p} onClick={() => setPay(p)}>{p}</Option>)}
          </div>
        </Section>
      </div>
      <aside className="h-fit rounded-2xl border border-border bg-card p-5 md:sticky md:top-24">
        <h2 className="font-extrabold">Bill details</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          <Row k={`Items (${sum.count})`} v={inr(sum.itemTotal)} />
          {sum.couponOff > 0 && <Row k="Coupon" v={`−${inr(sum.couponOff)}`} />}
          <Row k="Delivery" v={sum.delivery ? inr(sum.delivery) : "FREE"} />
          <Row k="Handling" v={inr(sum.handling)} />
          <Row k="GST" v={inr(sum.gst)} />
          <div className="border-t border-border pt-2"><Row k="To pay" v={inr(sum.total)} bold /></div>
        </dl>
        {sum.savings > 0 && <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">You save {inr(sum.savings)} on this order</p>}
        <button
          onClick={() => {
            const order = placeOrder();
            toast.success("Order placed! Arriving in 10 mins");
            navigate({ to: "/track", search: { id: order.id } });
          }}
          className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-95"
        >
          Place order · {inr(sum.total)}
        </button>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-2 rounded-2xl border border-border bg-card p-4"><h2 className="font-bold">{title}</h2>{children}</section>;
}
function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("w-full rounded-xl border px-3 py-2.5 text-left text-sm", active ? "border-primary bg-primary/10" : "border-border hover:bg-muted")}>{children}</button>;
}
function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className={cn("flex justify-between", bold && "font-extrabold")}><dt>{k}</dt><dd>{v}</dd></div>;
}
