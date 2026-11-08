"use client";

import { startTransition, useActionState, useEffect } from "react";
import { submitEnquiry, type EnquiryResult } from "@/app/actions";
import { useShell } from "./Shell";

type Props = {
  type: "car" | "viewing" | "hire" | "import" | "general";
  carId?: string;
  /** Extra structured data saved with the enquiry (hire date, etc.). */
  details?: Record<string, unknown>;
  message?: string;
  messageLabel?: string;
  submitLabel?: string;
  /** Optional WhatsApp alternative. */
  waHref?: string;
  showDate?: boolean;
  /** Hide the optional email field. */
  compact?: boolean;
};

export default function EnquiryForm({
  type, carId, details, message = "", messageLabel = "Message", submitLabel = "Send", waHref, showDate, compact,
}: Props) {
  const [state, action, pending] = useActionState<EnquiryResult | null, FormData>(submitEnquiry, null);
  const { toast } = useShell();

  useEffect(() => {
    if (state?.ok) toast("Sent. We'll be in touch shortly.");
  }, [state, toast]);

  const err = (k: string) => state?.fieldErrors?.[k];

  if (state?.ok)
    return (
      <div className="form-done" role="status">
        <span className="form-done__tick">✓</span>
        <div>
          <strong>Thank you, we&apos;ve received your request.</strong>
          <p>Our team will call or WhatsApp you, usually the same working day.</p>
          {waHref && <a className="link" href={waHref} target="_blank" rel="noopener">Or continue on WhatsApp →</a>}
        </div>
      </div>
    );

  return (
    <form
      className="eform"
      noValidate
      onSubmit={(e) => {
        // Submit manually so typed values survive a validation error.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="type" value={type} />
      {carId && <input type="hidden" name="carId" value={carId} />}
      <input type="hidden" name="details" value={JSON.stringify(details ?? {})} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

      <label className={err("name") ? "has-error" : ""}>
        <span>Name</span>
        <input name="name" autoComplete="name" required />
        {err("name") && <em>{err("name")}</em>}
      </label>
      <label className={err("phone") ? "has-error" : ""}>
        <span>Phone</span>
        <input name="phone" type="tel" autoComplete="tel" required placeholder="+254 7XX XXX XXX" />
        {err("phone") && <em>{err("phone")}</em>}
      </label>
      {!compact && (
        <label className={`${err("email") ? "has-error" : ""} ${showDate ? "" : "eform__wide"}`}>
          <span>Email <small>(optional)</small></span>
          <input name="email" type="email" autoComplete="email" />
          {err("email") && <em>{err("email")}</em>}
        </label>
      )}
      {showDate && (
        <label>
          <span>Preferred date</span>
          <input name="viewingDate" type="date" min={new Date().toISOString().slice(0, 10)} />
        </label>
      )}
      <label className="eform__wide">
        <span>{messageLabel}</span>
        <textarea name="message" rows={3} defaultValue={message} />
      </label>

      {state?.error && <p className="eform__error" role="alert">{state.error}</p>}
      <div className="eform__actions">
        <button className="btn btn--primary" disabled={pending}>{pending ? "Sending…" : submitLabel}</button>
        {waHref && <a className="btn btn--ghost" href={waHref} target="_blank" rel="noopener">WhatsApp instead</a>}
      </div>
    </form>
  );
}
