import { Link } from "@tanstack/react-router";
import { Apple, Play, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  { q: "How is 10-minute delivery possible?", a: "We stock nearby micro-stores, so your order travels under 2 km." },
  { q: "Is there a minimum order value?", a: "No minimum. Delivery is free above ₹199, otherwise ₹29." },
  { q: "How does Ask FreshMind work?", a: "Tell it what you want to cook and it builds the basket for you." },
  { q: "Can I return an item?", a: "Yes — report any issue within 24 hours for an instant refund." },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="size-5" />
            </span>
            <span className="text-base font-extrabold">FreshMind</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Groceries in 10 minutes, planned by AI. Fresh picks, fair prices, zero guesswork.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold">
              <Apple className="size-4" /> App Store
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold">
              <Play className="size-4" /> Google Play
            </span>
          </div>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <h2 className="text-sm font-extrabold">Explore</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/search" search={{ q: "" }} className="hover:text-primary">All products</Link></li>
            <li><Link to="/checkout" className="hover:text-primary">Checkout</Link></li>
            <li><Link to="/track" className="hover:text-primary">Track order</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-extrabold">FAQs</h2>
          <Accordion type="single" collapsible className="mt-1">
            {FAQS.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <p className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FreshMind. Demo experience with mock data.
      </p>
    </footer>
  );
}
