import type { Metadata } from "next";
import Visit from "@/components/Visit";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact & visit",
  description: "RNN Motors, The Retro Hub, Ndoto Road off James Gichuru Road, Lavington, Nairobi. Open Mon–Fri 9–5, Sat 9–1.",
};

export default function VisitPage() {
  return (
    <div className="page">
      <div className="wrap">
        <header className="page__head">
          <p className="eyebrow">Contact</p>
          <h1 className="h1">Visit or get in touch</h1>
          <p>Drop by during opening hours, or send a message and we&apos;ll get back to you.</p>
        </header>
      </div>
      <Visit heading={false} />
      <div className="wrap">
        <section className="panel split" style={{ marginTop: "clamp(40px,5vw,64px)" }}>
          <div>
            <h2 className="h2">Send a message</h2>
            <p>Questions about a car, trade-ins or financing? We usually reply the same working day.</p>
          </div>
          <EnquiryForm type="general" submitLabel="Send message" />
        </section>
      </div>
    </div>
  );
}
