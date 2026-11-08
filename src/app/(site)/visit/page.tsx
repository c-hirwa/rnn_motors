import type { Metadata } from "next";
import Visit from "@/components/Visit";
import EnquiryForm from "@/components/EnquiryForm";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Visit the showroom",
  description: "RNN Motors, The Retro Hub, Ndoto Road off James Gichuru Road, Lavington, Nairobi. Open Mon–Fri 9–5, Sat 9–1.",
};

export default function VisitPage() {
  return (
    <div className="page page--visit">
      <header className="page__head">
        <p className="eyebrow"><span className="line" /> Visit</p>
        <h1 className="h1">Come and <em>sit in one.</em></h1>
        <p className="page__lede">The Retro Hub, Ndoto Road, Lavington. Drop in during opening hours, or book a time and we'll have the car ready.</p>
      </header>
      <Visit heading={false} />
      <section className="contact" data-reveal>
        <div>
          <p className="eyebrow"><span className="line" /> Send a message</p>
          <h2 className="h2">Ask us <em>anything.</em></h2>
          <p className="muted">Trade-ins, financing, a car you've seen elsewhere: tell us what you need and we'll get back to you.</p>
        </div>
        <EnquiryForm type="general" submitLabel="Send message" waHref={waLink("Hi RNN Motors, ")} />
      </section>
    </div>
  );
}
