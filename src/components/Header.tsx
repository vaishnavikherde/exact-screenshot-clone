import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Crosshair, MapPin, Moon, Search, ShoppingCart, Sun, Zap, User } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCartSummary } from "@/lib/cart";
import { login, setPin, useAppState } from "@/lib/cart";
import { openCart, setAuthOpen, setLocationOpen, toggleTheme, useUI } from "@/lib/ui";
import { inr } from "@/lib/utils";

const PLACEHOLDERS = ["milk", "chips", "paneer", "bananas", "coffee", "eggs"];

export function Header() {
  const navigate = useNavigate();
  const { count, itemTotal } = useCartSummary();
  const theme = useUI((s) => s.theme);
  const pin = useAppState((s) => s.pin);
  const [term, setTerm] = useState("");
  const [idx, setIdx] = useState(0);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(count);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (count > prevCount.current && badgeRef.current) {
      badgeRef.current.classList.remove("animate-badge-bounce");
      void badgeRef.current.offsetWidth;
      badgeRef.current.classList.add("animate-badge-bounce");
    }
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: term } });
  };

  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:grid-cols-[auto_auto_minmax(0,1fr)_auto]">
        <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="FreshMind home">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold leading-4">FreshMind</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              Delivery in 10 mins
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setLocationOpen(true)}
          className="hidden items-center gap-1 rounded-xl px-2 py-1.5 text-left text-xs font-semibold hover:bg-muted lg:flex"
        >
          <MapPin className="size-4 text-primary" />
          <span>
            <span className="block text-muted-foreground">Deliver to</span>
            <span className="block">{pin}</span>
          </span>
          <ChevronDown className="size-4" />
        </button>

        <form
          onSubmit={submit}
          role="search"
          className="col-span-2 order-last flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 lg:order-none lg:col-span-1"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <label className="sr-only" htmlFor="site-search">
            Search for groceries
          </label>
          <input
            id="site-search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={`Search "${PLACEHOLDERS[idx]}"`}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="grid size-10 place-items-center rounded-xl border border-border hover:bg-muted"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="hidden h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold hover:bg-muted sm:flex"
          >
            <User className="size-4" /> Login
          </button>
          <button
            id="cart-button"
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} items, ${inr(itemTotal)}`}
            className="relative flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground transition active:scale-95"
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">{count > 0 ? inr(itemTotal) : "Cart"}</span>
            {count > 0 && (
              <span
                ref={badgeRef}
                className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-accent-foreground"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <LocationModal currentPin={pin} />
      <AuthModal />
    </header>
  );
}

function LocationModal({ currentPin }: { currentPin: string }) {
  const open = useUI((s) => s.locationOpen);
  const [value, setValue] = useState(currentPin);

  return (
    <Dialog open={open} onOpenChange={setLocationOpen}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Where should we deliver?</DialogTitle>
          <DialogDescription>Enter your pin code for accurate delivery times.</DialogDescription>
        </DialogHeader>
        <Input
          value={value}
          inputMode="numeric"
          maxLength={6}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
          aria-label="Pin code"
          placeholder="400076"
          className="rounded-xl"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setValue("560001");
              toast.success("Location detected: Bengaluru 560001");
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-bold hover:bg-muted"
          >
            <Crosshair className="size-4" /> Detect my location
          </button>
          <button
            type="button"
            onClick={() => {
              if (value.length !== 6) { toast.error("Enter a 6-digit pin code"); return; }
              setPin(value);
              setLocationOpen(false);
              toast.success(`Delivering to ${value} in 10 mins`);
            }}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground active:scale-95"
          >
            Save address
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuthModal() {
  const open = useUI((s) => s.authOpen);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  return (
    <Dialog open={open} onOpenChange={setAuthOpen}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{step === "phone" ? "Login to FreshMind" : "Verify your number"}</DialogTitle>
          <DialogDescription>
            {step === "phone" ? "We'll text you a 4-digit code." : `Code sent to +91 ${phone}. Use 1234.`}
          </DialogDescription>
        </DialogHeader>
        {step === "phone" ? (
          <>
            <Input
              value={phone}
              inputMode="tel"
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              aria-label="Phone number"
              placeholder="10-digit mobile number"
              className="rounded-xl"
            />
            <button
              type="button"
              onClick={() => (phone.length === 10 ? setStep("otp") : toast.error("Enter 10 digits"))}
              className="rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground active:scale-95"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <Input
              value={otp}
              inputMode="numeric"
              maxLength={4}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              aria-label="One-time code"
              placeholder="····"
              className="rounded-xl text-center text-lg tracking-[0.6em]"
            />
            <button
              type="button"
              onClick={() => {
                if (otp !== "1234") { toast.error("Invalid code — try 1234"); return; }
                login(phone);
                setAuthOpen(false);
                setStep("phone");
                toast.success("Logged in. Welcome to FreshMind!");
              }}
              className="rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground active:scale-95"
            >
              Verify & continue
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
