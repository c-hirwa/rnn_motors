import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminNav from "./AdminNav";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · RNN Admin" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const newEnquiries = await db.enquiry.count({ where: { status: "new" } });
  return (
    <div className="admin">
      <AdminNav name={session.name} email={session.email} newEnquiries={newEnquiries} />
      <div className="admin__main">{children}</div>
    </div>
  );
}
