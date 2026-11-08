import { getSession } from "@/lib/auth";
import PasswordForm from "./PasswordForm";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const s = await getSession();
  return (
    <>
      <header className="ahead">
        <div>
          <h1>Settings</h1>
          <p>Signed in as {s?.email}.</p>
        </div>
      </header>
      <section className="apanel apanel--narrow">
        <h2>Change password</h2>
        <PasswordForm />
      </section>
    </>
  );
}
