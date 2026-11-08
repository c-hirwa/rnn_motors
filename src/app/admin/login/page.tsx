import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";
import "../admin.css";

export const metadata: Metadata = { title: "Staff login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="login">
      <div className="login__card">
        <div className="brand"><span className="brand__rnn">RNN</span><span className="brand__motors">Motors</span></div>
        <h1>Staff login</h1>
        <p>Manage inventory, photos and enquiries.</p>
        <LoginForm next={next ?? ""} />
      </div>
      <a className="login__back" href="/">← Back to the website</a>
    </div>
  );
}
