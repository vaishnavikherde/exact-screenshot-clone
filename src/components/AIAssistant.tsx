import { useEffect, useRef, useState } from "react";
import { Mic, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { askAI, type AIItem } from "@/lib/ai";
import { addToCart } from "@/lib/cart";
import { setAIOpen, useUI } from "@/lib/ui";
import { cn, inr } from "@/lib/utils";
import { ProductArt } from "./ProductCard";

type Msg = { id: number; role: "user" | "ai"; text: string; items?: AIItem[] };

const SUGGESTIONS = [
  "I want to make pasta for 4 people",
  "Healthy breakfast under ₹300",
  "Weekly basket for 2 under ₹1200",
  "Movie night snacks",
];

export function AIAssistant() {
  const open = useUI((s) => s.aiOpen);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 0,
      role: "ai",
      text: "Hi! I'm FreshMind AI. Tell me what you're cooking or craving and I'll build the basket.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streamed, setStreamed] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking, streamed]);

  const send = async (prompt: string) => {
    const q = prompt.trim();
    if (!q || thinking) return;
    setInput("");
    setMsgs((m) => [...m, { id: Date.now(), role: "user", text: q }]);
    setThinking(true);
    const answer = await askAI(q);
    setThinking(false);

    // streaming-text animation
    let i = 0;
    setStreamed("");
    const timer = setInterval(() => {
      i += 2;
      setStreamed(answer.reply.slice(0, i));
      if (i >= answer.reply.length) {
        clearInterval(timer);
        setStreamed(null);
        setMsgs((m) => [
          ...m,
          { id: Date.now() + 1, role: "ai", text: answer.reply, items: answer.items },
        ]);
      }
    }, 14);
  };

  const listen = () => {
    const SR =
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition; SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input isn't supported in this browser");
    const rec = new SR();
    rec.lang = "en-IN";
    rec.onresult = (e: SpeechRecognitionEvent) => send(e.results[0][0].transcript);
    rec.onerror = () => toast.error("Didn't catch that — try again");
    rec.start();
    toast("Listening…");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAIOpen(!open)}
        aria-label={open ? "Close FreshMind AI" : "Ask FreshMind AI"}
        className="animate-glow-pulse fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2 rounded-full bg-ai px-5 text-sm font-extrabold text-ai-foreground shadow-lift transition active:scale-95"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "Ask FreshMind"}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="FreshMind AI assistant"
          className="animate-pop-in glass fixed bottom-24 right-4 z-50 flex h-[70vh] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-ai/30 shadow-lift"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Sparkles className="size-4 text-ai" />
            <p className="text-sm font-extrabold">FreshMind AI</p>
            <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
              beta
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m) => (
              <div key={m.id} className={cn("animate-pop-in", m.role === "user" && "text-right")}>
                <p
                  className={cn(
                    "inline-block max-w-[85%] rounded-2xl px-3 py-2 text-left text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground shadow-soft",
                  )}
                >
                  {m.text}
                </p>
                {m.items && m.items.length > 0 && <ItemList items={m.items} />}
              </div>
            ))}

            {thinking && (
              <div className="flex gap-1 rounded-2xl bg-surface px-3 py-3 shadow-soft" aria-label="Thinking">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="animate-typing size-2 rounded-full bg-ai"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
            {streamed !== null && (
              <p className="inline-block max-w-[85%] rounded-2xl bg-surface px-3 py-2 text-sm shadow-soft">
                {streamed}
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-ai align-middle" />
              </p>
            )}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:border-ai"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <label className="sr-only" htmlFor="ai-input">
              Ask FreshMind
            </label>
            <input
              id="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything… 'dinner for 4'"
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={listen}
              aria-label="Speak your request"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-border hover:bg-muted"
            >
              <Mic className="size-4" />
            </button>
            <button
              type="submit"
              aria-label="Send"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-ai text-ai-foreground active:scale-95"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ItemList({ items }: { items: AIItem[] }) {
  const total = items.reduce((n, i) => n + i.product.price * i.qty, 0);
  return (
    <div className="mt-2 rounded-2xl border border-border bg-surface p-3 text-left">
      <ul className="space-y-2">
        {items.map(({ product, qty }) => (
          <li key={product.id} className="flex items-center gap-2">
            <ProductArt product={product} className="size-9" size="text-base" />
            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
              {product.name} × {qty}
            </span>
            <span className="text-xs font-bold">{inr(product.price * qty)}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          items.forEach(({ product, qty }) => addToCart(product, product.unit, qty));
          toast.success("Added to cart");
        }}
        className="mt-3 w-full rounded-xl bg-primary py-2 text-xs font-extrabold text-primary-foreground active:scale-95"
      >
        Add all to cart · {inr(total)}
      </button>
    </div>
  );
}
