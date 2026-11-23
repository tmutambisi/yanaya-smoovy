"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLLECTION_POINTS, DEPOT, SUBURBS } from "@/lib/config";
import { useOrder } from "@/lib/order-store";
import { InstallApp } from "./InstallApp";

/** Official Yanaya logo (transparent cut-out made from the client's logo file). */
const LOGO = { src: "/brand/yanaya-logo.png", width: 640, height: 250 };

/** Logo linking home. */
export function Logo() {
  return (
    <Link href="/" aria-label="Yanaya home" className="inline-block">
      <YanayaBadge size="sm" />
    </Link>
  );
}

/** The logo image. `lg` for the splash screen, `sm` for headers. */
export function YanayaBadge({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <Image
      src={LOGO.src}
      width={LOGO.width}
      height={LOGO.height}
      alt="Yanaya: It Will End In Health"
      priority={size === "lg"}
      className={size === "lg" ? "h-auto w-80 max-w-[85vw] drop-shadow-xl" : "h-10 w-auto"}
    />
  );
}

/** Dark app bar used on every inner screen (and the splash, with `welcome`). */
export function TopBar({ back, title, welcome }: { back?: string; title?: string; welcome?: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 bg-night text-white">
        <div className="mx-auto flex h-16 max-w-xl items-center gap-3 px-4">
          {back ? (
            <button
              onClick={() => router.push(back)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-white"
              aria-label="Back"
            >
              <ArrowIcon className="h-4 w-4" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            {welcome !== undefined ? (
              <p className="truncate text-base font-semibold">{welcome}</p>
            ) : title ? (
              <h1 className="truncate text-lg font-bold">{title}</h1>
            ) : (
              <ModeSummary />
            )}
          </div>
          <Link href="/" aria-label="Yanaya home" className="shrink-0">
            <YanayaBadge size="sm" />
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="-mr-1 grid h-10 w-10 shrink-0 place-items-center"
            aria-label="Open menu"
          >
            <MenuIcon className="h-7 w-7" />
          </button>
        </div>
      </header>
      {menuOpen ? <MenuDrawer onClose={() => setMenuOpen(false)} /> : null}
    </>
  );
}

/** "Delivery" pill + address line (or collection point), like the QSR apps. */
function ModeSummary() {
  const { mode, location, collectPointId, hydrated } = useOrder();
  if (!hydrated || !mode) return null;
  const suburb = SUBURBS.find((s) => s.id === location?.suburbId);
  const point = COLLECTION_POINTS.find((p) => p.id === collectPointId) ?? DEPOT;
  return (
    <div className="min-w-0">
      <Link
        href="/"
        className="inline-block rounded-full border-2 border-white px-3 text-xs leading-5 font-bold capitalize"
        title="Change order type"
      >
        {mode}
      </Link>
      <Link
        href={mode === "delivery" ? "/location" : "/collect"}
        className="mt-0.5 block truncate text-sm font-semibold text-white/90"
      >
        {mode === "delivery"
          ? suburb
            ? `${location?.address ? `${location.address}, ` : ""}${suburb.name}`
            : "Set delivery address"
          : point.name}
      </Link>
    </div>
  );
}

function MenuDrawer({ onClose }: { onClose: () => void }) {
  const { orders, hydrated } = useOrder();
  const recent = hydrated
    ? Object.values(orders)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3)
    : [];
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
      <button className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close menu" />
      <nav className="absolute top-0 right-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
        <div className="flex h-16 items-center justify-between bg-night px-4 text-white">
          <YanayaBadge size="sm" />
          <button onClick={onClose} className="grid h-10 w-10 place-items-center text-2xl" aria-label="Close menu">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <InstallApp />
          <MenuLink href="/" onClick={onClose}>
            Start new order
          </MenuLink>
          <MenuLink href="/order" onClick={onClose}>
            Order Smoovy Baobab
          </MenuLink>
          <MenuLink href="/store#menu" onClick={onClose}>
            Full menu
          </MenuLink>
          {recent.length ? (
            <p className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">My orders</p>
          ) : null}
          {recent.map((o) => (
            <MenuLink key={o.token} href={`/order/${o.token}`} onClick={onClose}>
              {o.token} · {o.quote.qty} bottles
            </MenuLink>
          ))}
          <p className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">More</p>
          <MenuLink href="/store#corporate" onClick={onClose}>
            Corporate &amp; bulk orders
          </MenuLink>
          <MenuLink href="/store#help" onClick={onClose}>
            Help &amp; contact
          </MenuLink>
        </div>
      </nav>
    </div>
  );
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block rounded-xl px-3 py-3 font-semibold hover:bg-cream">
      {children}
    </Link>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-5 text-base font-bold text-white shadow-lg shadow-leaf-900/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/20 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

export function StickyFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}

/* ---------- Icons (inline SVG, no icon library) ---------- */
type IconProps = { className?: string };

export const LeafIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20 3C10 3 4 9 4 17c0 1.2.2 2.4.5 3.5.3.1 1.5-3.9 6.5-7.5-3.5 3.9-5 7.3-5 8 8 0 14-6 14-15V3Z" />
  </svg>
);
export const ArrowIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className={className} aria-hidden>
    <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const MenuIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className={className} aria-hidden>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" strokeLinecap="round" />
  </svg>
);
export const ClockIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);
export const ChevronIcon =({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className} aria-hidden>
    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const PinIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);
export const ScooterIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
    <circle cx="6" cy="17" r="2.5" />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M8.5 17h7M15 6h2l3 8.5M4 13h7l2-4h3M4 9h5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const BagIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
    <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" strokeLinecap="round" />
  </svg>
);
export const CheckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className} aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const LocateIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
  </svg>
);

export function BottleArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-hidden>
      <defs>
        {/* creamy baobab smoothie */}
        <linearGradient id="juice" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f1ead0" />
          <stop offset="1" stopColor="#d8cb9e" />
        </linearGradient>
      </defs>
      <rect x="44" y="6" width="32" height="22" rx="5" fill="#00662a" stroke="#2a2a2c" strokeWidth="3" />
      <path d="M46 28h28v18c0 6 16 12 16 30v124a14 14 0 0 1-14 14H44a14 14 0 0 1-14-14V76c0-18 16-24 16-30V28Z" fill="#fff" fillOpacity=".92" stroke="#2a2a2c" strokeWidth="3" />
      <path d="M34 92h52v108a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10V92Z" fill="url(#juice)" />
      <rect x="34" y="116" width="52" height="58" fill="#00662a" />
      <rect x="34" y="116" width="52" height="4" fill="#9ab46c" />
      <rect x="34" y="170" width="52" height="4" fill="#9ab46c" />
      <text x="60" y="142" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">SMOOVY</text>
      <text x="60" y="158" textAnchor="middle" fontSize="10" fontWeight="700" fill="#9ab46c">BAOBAB</text>
      <path d="M52 34v14M58 34v10" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
