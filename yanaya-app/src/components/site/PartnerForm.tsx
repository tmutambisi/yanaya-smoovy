"use client";

import { useState } from "react";
import { PARTNER_INTERESTS, SITE, whatsappLink } from "@/lib/smoovy";
import { CheckIcon, PlayTri, WhatsAppIcon } from "./icons";

/** Zimbabwe mobile (0771 234 567 / +263 771 234 567) or any international number (+27…, +44…). */
const ZW_PHONE = /^(?:(?:\+?263|0)7[1-8]\d{7}|\+\d{9,15})$/;
const EMAIL = /^\S+@\S+\.\S+$/;

type Fields = {
  name: string;
  email: string;
  business: string;
  city: string;
  type: string;
  phone: string;
};
const EMPTY: Fields = { name: "", email: "", business: "", city: "", type: "", phone: "" };

/**
 * "Partnership & Ordering Inquiry", the catalogue's form made digital.
 * No server: it composes a tidy message and opens WhatsApp to Smoovy, ready to send.
 */
export function PartnerForm({ compact = false }: { compact?: boolean }) {
  const [f, setF] = useState<Fields>(EMPTY);
  const [interests, setInterests] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const errors = {
    name: f.name.trim().length < 2 ? "Please enter your name." : "",
    phone: !ZW_PHONE.test(f.phone.replace(/[\s-]/g, "")) ? "Enter a phone number, e.g. 0771 234 567 or +27 82 123 4567." : "",
    email: f.email.trim() && !EMAIL.test(f.email.trim()) ? "Check your email address." : "",
    interests: interests.length === 0 ? "Choose at least one option." : "",
  };
  const valid = !Object.values(errors).some(Boolean);
  const err = (k: keyof typeof errors) => (touched ? errors[k] : "");

  const toggle = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  const message = () => {
    const lines = ["Hi Smoovy! Partnership & Ordering Inquiry", "", `Name: ${f.name.trim()}`];
    const opt = (label: string, v: string) => v.trim() && lines.push(`${label}: ${v.trim()}`);
    opt("Business", f.business);
    opt("Business type", f.type);
    opt("City", f.city);
    lines.push(`Phone: ${f.phone.trim()}`);
    opt("Email", f.email);
    lines.push("", `Interested in: ${interests.join(", ")}`);
    return lines.join("\n");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    window.open(whatsappLink(message()), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const field = (k: keyof Fields, label: string, opts: { type?: string; auto?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; required?: boolean } = {}) => {
    const e = k in errors ? err(k as keyof typeof errors) : "";
    return (
      <label className="block">
        <span className="font-display text-lg font-bold uppercase">
          {label}
          {opts.required ? <span className="text-sage"> *</span> : null}
        </span>
        <input
          type={opts.type ?? "text"}
          inputMode={opts.inputMode}
          autoComplete={opts.auto}
          value={f[k]}
          onChange={(ev) => setF({ ...f, [k]: ev.target.value })}
          aria-invalid={!!e}
          className={`mt-1.5 h-13 w-full rounded-xl border-2 bg-white px-4 text-lg text-night outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/30 ${
            e ? "border-[#b3261e]" : "border-night/15"
          }`}
        />
        {e ? <span className="mt-1 block text-sm text-[#ff8a80]">{e}</span> : null}
      </label>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="text-white">
      {!compact ? (
        <>
          <p className="font-display flex items-center gap-2 text-xl font-bold tracking-wide text-sage uppercase">
            <PlayTri className="h-3.5 w-3" /> Flavours | <b className="text-white">Find your energy</b>
          </p>
          <h2 id="partner-title" className="font-display mt-2 text-5xl leading-[0.9] font-extrabold uppercase md:text-7xl">
            Partnership &amp; ordering inquiry
          </h2>
          <p className="font-display mt-3 text-2xl font-bold text-sage">
            Shops, gyms, offices and distributors: let&apos;s talk.
          </p>
        </>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {field("name", "Full name", { auto: "name", required: true })}
        {field("email", "E-mail address", { type: "email", auto: "email", inputMode: "email" })}
        {field("business", "Business name", { auto: "organization" })}
        {field("city", "Business location (city)", { auto: "address-level2" })}
        {field("type", "Business type (e.g. restaurant)")}
        {field("phone", "Phone number", { type: "tel", auto: "tel", inputMode: "tel", required: true })}
      </div>

      <fieldset className="mt-7">
        <legend className="font-display text-lg font-bold uppercase">
          I am interested in <span className="text-sage">*</span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PARTNER_INTERESTS.map((i) => {
            const on = interests.includes(i);
            return (
              <button
                type="button"
                key={i}
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(i)}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-lg transition ${
                  on ? "border-sage bg-sage/15" : "border-white/20 hover:border-white/40"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${
                    on ? "border-sage bg-sage text-night" : "border-white/50"
                  }`}
                >
                  {on ? <CheckIcon className="h-4 w-4" /> : null}
                </span>
                {i}
              </button>
            );
          })}
        </div>
        {err("interests") ? <p className="mt-2 text-sm text-[#ff8a80]">{err("interests")}</p> : null}
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="font-display sticker sticker-press inline-flex items-center gap-3 rounded-full bg-sage px-7 py-3.5 text-2xl font-extrabold text-night uppercase"
        >
          <WhatsAppIcon className="h-6 w-6" /> Send on WhatsApp
        </button>
        <p className="text-white/70">
          or call <a href={`tel:+${SITE.whatsappIntl}`} className="font-bold text-white underline">{SITE.whatsappDisplay}</a>
        </p>
      </div>
      <p aria-live="polite" className="mt-4 min-h-6 text-sage">
        {sent ? "WhatsApp opened with your details. Just press send and we'll reply soon." : ""}
      </p>
    </form>
  );
}
