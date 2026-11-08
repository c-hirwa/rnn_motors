"use client";

import { useState } from "react";
import { waLink } from "@/lib/site";

type Props = {
  /** First line of the WhatsApp message, e.g. "I'd like to view the 2022 Aston Martin DBX." */
  intro: string;
  /** Extra lines added to the message (hire date, pick-up…). */
  details?: Record<string, string>;
  message?: string;
  messageLabel?: string;
  submitLabel?: string;
  showDate?: boolean;
};

/**
 * Collects the visitor's details and opens WhatsApp with a ready-to-send
 * message to RNN Motors. (No database: nothing is stored on the website.)
 */
export default function EnquiryForm({
  intro, details, message = "", messageLabel = "Message", submitLabel = "Send on WhatsApp", showDate,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phone = String(f.get("phone") || "").trim();
    const date = String(f.get("date") || "");
    const msg = String(f.get("message") || "").trim();

    const errs: Record<string, string> = {};
    if (name.length < 2) errs.name = "Please enter your name";
    if (phone && !/^[+\d][\d\s()-]{6,}$/.test(phone)) errs.phone = "Check this number";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const lines = [
      `Hi RNN Motors, ${intro}`,
      "",
      ...Object.entries(details ?? {}).filter(([, v]) => v).map(([k, v]) => `• ${k}: ${v}`),
      date ? `• Preferred date: ${date}` : "",
      msg ? `\n${msg}` : "",
      "",
      `Name: ${name}${phone ? `\nPhone: ${phone}` : ""}`,
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "");
    const url = waLink(lines.join("\n"));
    setSent(url);
    window.open(url, "_blank", "noopener");
  };

  if (sent)
    return (
      <div className="form-done" role="status">
        <span className="form-done__tick">✓</span>
        <div>
          <strong>Your message is ready in WhatsApp.</strong>
          <p>Press send in WhatsApp and our team will reply, usually the same working day.</p>
          <a className="link" href={sent} target="_blank" rel="noopener">WhatsApp didn&apos;t open? Tap here →</a>
        </div>
      </div>
    );

  return (
    <form className="eform" noValidate onSubmit={onSubmit}>
      <label className={errors.name ? "has-error" : ""}>
        <span>Name</span>
        <input name="name" autoComplete="name" required />
        {errors.name && <em>{errors.name}</em>}
      </label>
      <label className={errors.phone ? "has-error" : ""}>
        <span>Phone <small>(optional)</small></span>
        <input name="phone" type="tel" autoComplete="tel" placeholder="+254 7XX XXX XXX" />
        {errors.phone && <em>{errors.phone}</em>}
      </label>
      {showDate && (
        <label className="eform__wide">
          <span>Preferred date</span>
          <input name="date" type="date" min={new Date().toISOString().slice(0, 10)} />
        </label>
      )}
      <label className="eform__wide">
        <span>{messageLabel}</span>
        <textarea name="message" rows={3} defaultValue={message} />
      </label>
      <div className="eform__actions">
        <button className="btn btn--wa">{submitLabel}</button>
      </div>
      <p className="eform__note">Opens WhatsApp with your message filled in, ready to send.</p>
    </form>
  );
}
