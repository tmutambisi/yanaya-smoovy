"use client";

/**
 * Client-side order state (mock — no backend yet).
 * Later: cart stays client-side, but placed orders come from Supabase.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DELIVERY_MIN_BOTTLES, type PaymentMethodId } from "./config";
import { quote, type FulfilmentMode, type Quote } from "./pricing";

export interface DeliveryLocation {
  suburbId: string;
  address: string;
  notes: string;
  coords: { lat: number; lng: number } | null;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  isCorporate: boolean;
  company: string;
}

export type OrderStatus =
  | "received"
  | "preparing"
  | "out_for_delivery"
  | "ready_for_collection"
  | "completed";

export interface PlacedOrder {
  token: string;
  createdAt: string;
  mode: FulfilmentMode;
  location: DeliveryLocation | null;
  customer: CustomerDetails;
  paymentMethod: PaymentMethodId;
  /** false for pay-on-delivery / pay-at-collection until staff mark it paid */
  paid: boolean;
  quote: Quote;
  status: OrderStatus;
}

interface State {
  /** What the customer chose. */
  preferredMode: FulfilmentMode | null;
  location: DeliveryLocation | null;
  /** Click & Collect point id (see COLLECTION_POINTS). */
  collectPointId: string | null;
  quantity: number;
  customer: CustomerDetails;
  orders: Record<string, PlacedOrder>;
}

const EMPTY_CUSTOMER: CustomerDetails = {
  name: "",
  phone: "",
  email: "",
  isCorporate: false,
  company: "",
};

const INITIAL: State = {
  preferredMode: null,
  location: null,
  collectPointId: null,
  quantity: DELIVERY_MIN_BOTTLES,
  customer: EMPTY_CUSTOMER,
  orders: {},
};

const STORAGE_KEY = "yanaya-order-v2";

/**
 * Proposal rule: under 10 bottles the order defaults to Depot Collection.
 * If the customer chose Delivery and drops below 10, the order becomes Collect;
 * going back to 10+ restores their Delivery choice automatically.
 */
export function effectiveMode(preferred: FulfilmentMode, qty: number): FulfilmentMode {
  return preferred === "delivery" && qty < DELIVERY_MIN_BOTTLES ? "collect" : preferred;
}

interface Ctx {
  hydrated: boolean;
  /** Mode actually used for the order (after the 10-bottle rule). */
  mode: FulfilmentMode | null;
  preferredMode: FulfilmentMode | null;
  /** True when the customer wanted delivery but the quantity is too low. */
  deliveryLocked: boolean;
  location: DeliveryLocation | null;
  collectPointId: string | null;
  quantity: number;
  customer: CustomerDetails;
  orders: Record<string, PlacedOrder>;
  setMode: (m: FulfilmentMode) => void;
  setCollectPoint: (id: string) => void;
  setLocation: (l: DeliveryLocation) => void;
  setQuantity: (q: number) => void;
  setCustomer: (c: CustomerDetails) => void;
  currentQuote: Quote | null;
  placeOrder: (paymentMethod: PaymentMethodId) => PlacedOrder | null;
  advanceStatus: (token: string) => void;
}

const OrderContext = createContext<Ctx | null>(null);

function makeToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `YN-${s}`;
}

export function nextStatus(mode: FulfilmentMode, s: OrderStatus): OrderStatus {
  const flow: OrderStatus[] =
    mode === "delivery"
      ? ["received", "preparing", "out_for_delivery", "completed"]
      : ["received", "preparing", "ready_for_collection", "completed"];
  const i = flow.indexOf(s);
  return flow[Math.min(i + 1, flow.length - 1)];
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  // Load saved state (wrapped: storage can be blocked / private mode)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  /** Choosing Delivery explicitly tops the order up to the delivery minimum. */
  const setMode = useCallback((preferredMode: FulfilmentMode) => {
    setState((s) => ({
      ...s,
      preferredMode,
      quantity:
        preferredMode === "delivery" ? Math.max(s.quantity, DELIVERY_MIN_BOTTLES) : s.quantity,
    }));
  }, []);

  const setLocation = useCallback((location: DeliveryLocation) => {
    setState((s) => ({ ...s, location }));
  }, []);

  const setCollectPoint = useCallback((collectPointId: string) => {
    setState((s) => ({ ...s, collectPointId }));
  }, []);

  const setQuantity = useCallback((quantity: number) => {
    setState((s) => ({ ...s, quantity }));
  }, []);

  const setCustomer = useCallback((customer: CustomerDetails) => {
    setState((s) => ({ ...s, customer }));
  }, []);

  const mode = state.preferredMode ? effectiveMode(state.preferredMode, state.quantity) : null;
  const deliveryLocked = state.preferredMode === "delivery" && mode === "collect";

  const currentQuote = useMemo(
    () => (mode ? quote(state.quantity, mode, state.location?.suburbId) : null),
    [mode, state.quantity, state.location?.suburbId],
  );

  const placeOrder = useCallback(
    (paymentMethod: PaymentMethodId) => {
      if (!mode || !currentQuote?.canCheckout) return null;
      const order: PlacedOrder = {
        token: makeToken(),
        createdAt: new Date().toISOString(),
        mode,
        location: mode === "delivery" ? state.location : null,
        customer: state.customer,
        paymentMethod,
        paid: paymentMethod !== "on_receipt",
        quote: currentQuote,
        status: "received",
      };
      setState((s) => ({ ...s, orders: { ...s.orders, [order.token]: order } }));
      return order;
    },
    [mode, state.location, state.customer, currentQuote],
  );

  const advanceStatus = useCallback((token: string) => {
    setState((s) => {
      const o = s.orders[token];
      if (!o) return s;
      const status = nextStatus(o.mode, o.status);
      // Pay-on-receipt orders count as paid once completed (staff confirm in /admin later)
      return {
        ...s,
        orders: { ...s.orders, [token]: { ...o, status, paid: o.paid || status === "completed" } },
      };
    });
  }, []);

  const value: Ctx = {
    hydrated,
    mode,
    preferredMode: state.preferredMode,
    deliveryLocked,
    location: state.location,
    collectPointId: state.collectPointId,
    quantity: state.quantity,
    customer: state.customer,
    orders: state.orders,
    setMode,
    setCollectPoint,
    setLocation,
    setQuantity,
    setCustomer,
    currentQuote,
    placeOrder,
    advanceStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}
