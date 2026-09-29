/** Imperative micro-interactions that are easier outside React. */

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Arcs a small product token from the tapped card into the cart button. */
export function flyToCart(from: HTMLElement | null, emoji: string) {
  if (typeof document === "undefined" || !from || reduced()) return;
  const target = document.getElementById("cart-button");
  if (!target) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const token = document.createElement("div");
  token.textContent = emoji;
  token.setAttribute("aria-hidden", "true");
  Object.assign(token.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - 16}px`,
    top: `${a.top + a.height / 2 - 16}px`,
    width: "32px",
    height: "32px",
    display: "grid",
    placeItems: "center",
    fontSize: "22px",
    borderRadius: "999px",
    zIndex: "80",
    pointerEvents: "none",
  } as CSSStyleDeclaration);
  document.body.appendChild(token);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);

  token
    .animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(1.2)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.2 },
      ],
      { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    )
    .addEventListener("finish", () => token.remove());

  target.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
    { duration: 400, delay: 560, easing: "cubic-bezier(0.34,1.56,0.64,1)" },
  );
}

/** Confetti burst when the free-delivery threshold is crossed. */
export function confettiBurst() {
  if (typeof document === "undefined" || reduced()) return;
  const target = document.getElementById("cart-button");
  if (!target) return;
  const r = target.getBoundingClientRect();
  const colors = ["#0C831F", "#FFC93C", "#6E56CF", "#FF7A59"];
  for (let i = 0; i < 14; i++) {
    const bit = document.createElement("span");
    Object.assign(bit.style, {
      position: "fixed",
      left: `${r.left + r.width / 2}px`,
      top: `${r.top + r.height / 2}px`,
      width: "7px",
      height: "7px",
      borderRadius: "2px",
      background: colors[i % colors.length],
      zIndex: "80",
      pointerEvents: "none",
    } as CSSStyleDeclaration);
    document.body.appendChild(bit);
    const angle = (Math.PI * 2 * i) / 14;
    const dist = 60 + Math.random() * 50;
    bit
      .animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist + 40}px) rotate(320deg)`,
            opacity: 0,
          },
        ],
        { duration: 800, easing: "cubic-bezier(0.2,0.8,0.2,1)" },
      )
      .addEventListener("finish", () => bit.remove());
  }
}
