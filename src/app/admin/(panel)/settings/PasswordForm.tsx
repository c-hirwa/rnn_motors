"use client";

import { useActionState } from "react";
import { changePassword } from "../../actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="aform" key={state?.ok ? "done" : "form"}>
      <label><span>Current password</span><input name="current" type="password" autoComplete="current-password" required /></label>
      <label><span>New password</span><input name="next" type="password" autoComplete="new-password" minLength={10} required /></label>
      <label><span>Repeat new password</span><input name="confirm" type="password" autoComplete="new-password" minLength={10} required /></label>
      {state?.error && <p className="aform__error" role="alert">{state.error}</p>}
      {state?.ok && <p className="aform__ok" role="status">✓ Password changed.</p>}
      <button className="btn btn--gold" disabled={pending}>{pending ? "Saving…" : "Update password"}</button>
    </form>
  );
}
