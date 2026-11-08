import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Import a car to Kenya",
  description: "Tell RNN Motors the car you want. We source it abroad, ship it, clear it and register it in Nairobi.",
};

const STEPS = [
  ["Tell us what you want", "Make, model, year, colour and budget."],
  ["We find and check it", "We source it from trusted sellers abroad and inspect it before buying."],
  ["We deliver it", "Shipping, clearing and registration handled. You collect it ready to drive."],
];

export default function ImportPage() {
  return (
    <div className="page">
      <div className="wrap">
        <header className="page__head">
          <p className="eyebrow">Importation</p>
          <h1 className="h1">Import a car</h1>
          <p>Can&apos;t find it in our showroom? We&apos;ll bring it in from Japan, the UK, the UAE or Europe.</p>
        </header>

        <ol className="steps3">
          {STEPS.map(([h, p], i) => (
            <li key={h}><b>{i + 1}</b><h3>{h}</h3><p>{p}</p></li>
          ))}
        </ol>

        <section className="panel split">
          <div>
            <h2 className="h2">Request a car</h2>
            <p>Share the details and we&apos;ll come back with options and a full price, including duty and delivery.</p>
          </div>
          <EnquiryForm
            intro="I'd like you to import a car for me."
            messageLabel="Which car are you looking for? (make, model, year, budget)"
            submitLabel="Send request on WhatsApp"
          />
        </section>
      </div>
    </div>
  );
}
