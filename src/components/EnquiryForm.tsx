"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { submitEnquiry, type EnquiryResult } from "@/app/actions";
import { useShell } from "./Shell";

type Props = {
  type: "car" | "viewing" | "hire" | "import" | "general";
  carId?: string;
  /** Extra structured data saved with the enquiry (hire date, import spec…). */
  details?: Record<string, unknown>;
  /** Default message text. */
  message?: string;
  messageLabel?: string;
  submitLabel?: string;
  /** WhatsApp link offered after a successful submit. */
  waHref?: string;
  showDate?: boolean;
  compact?: boolean;
  light?: boolean;
};

export default function EnquiryForm({
  type, carId, details, message = "", messageLabel = "Message", submitLabel = "Send enquiry",
  waHref, showDate, compact, light,
}: Props) {
  const [state, action, pending] = useActionState<EnquiryResult | null, FormData>(submitEnquiry, null);
  const { toast } = useShell();
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast("✓ Sent. The team will get back to you shortly.");
      form.current?.reset();
    }
  }, [state, toast]);

  const err = (k: string) => state?.fieldErrors?.[k];

  if (state?.ok)
    return (
      <div className={`form-done ${light ? "form-done--light" : ""}`} role="status">
        <span className="form-done__tick">✓</span>
        <div>
          <strong>Thank you, we've got it.</strong>
          <p>Someone from RNN Motors will call or WhatsApp you, usually the same working day.</p>
          {waHref && (
            <a className="link" href={waHref} target="_blank" rel="noopener">Can't wait? Continue on WhatsApp ↗</a>
          )}
        </div>
      </div>
    );

  return (
    <form
      ref={form}
      onSubmit={(e) => {
        // Submit manually so typed values survive a validation error.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className={`eform ${compact ? "eform--compact" : ""} ${light ? "eform--light" : ""}`} noValidate>
      <input type="hidden" name="type" value={type} />
      {carId && <input type="hidden" name="carId" value={carId} />}
      <input type="hidden" name="details" value={JSON.stringify(details ?? {})} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

      <label className={err("name") ? "has-error" : ""}>
        <span>Your name</span>
        <input name="name" autoComplete="name" required placeholder="Jane Wanjiku" />
        {err("name") && <em>{err("name")}</em>}
      </label>
      <label className={err("phone") ? "has-error" : ""}>
        <span>Phone / WhatsApp</span>
        <input name="phone" type="tel" autoComplete="tel" required placeholder="+254 7XX XXX XXX" />
        {err("phone") && <em>{err("phone")}</em>}
      </label>
      {!compact && (
        <label className={err("email") ? "has-error" : ""}>
          <span>Email <small>(optional)</small></span>
          <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          {err("email") && <em>{err("email")}</em>}
        </label>
      )}
      {showDate && (
        <label>
          <span>Preferred viewing date</span>
          <input name="viewingDate" type="date" min={new Date().toISOString().slice(0, 10)} />
        </label>
      )}
      <label className="eform__wide">
        <span>{messageLabel}</span>
        <textarea name="message" rows={compact ? 2 : 4} defaultValue={message} />
      </label>

      {state?.error && <p className="eform__error" role="alert">{state.error}</p>}
      <div className="eform__actions">
        <button className="btn btn--gold" disabled={pending} data-magnetic>
          {pending ? "Sending…" : submitLabel} <span className="arrow">→</span>
        </button>
        {waHref && (
          <a className="btn btn--ghost" href={waHref} target="_blank" rel="noopener">WhatsApp instead</a>
        )}
      </div>
      <p className="eform__note">We'll only use your details to reply to this enquiry.</p>
    </form>
  );
}
