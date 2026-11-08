"use client";

import { startTransition, useActionState } from "react";
import { login } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form
      className="aform"
      onSubmit={(e) => {
        // Submit manually so the fields aren't cleared when the password is wrong.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="next" value={next} />
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="username" required autoFocus />
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className="aform__error" role="alert">{state.error}</p>}
      <button className="btn btn--gold btn--block" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
