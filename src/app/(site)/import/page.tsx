import type { Metadata } from "next";
import ImportSteps from "@/components/ImportSteps";
import Estimator from "@/components/Estimator";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Car importation to Kenya",
  description:
    "Import your exact spec from Japan, the UK, the UAE or Europe. RNN Motors sources, inspects, ships, clears and registers your car. Estimate your landed cost in KES.",
};

const POPULAR = [
  "Mercedes-Maybach GLS 600", "Bentley Bentayga", "Porsche Taycan", "Mercedes-AMG G 63",
  "Audi A8 S-line", "Range Rover Autobiography", "Aston Martin DBX", "Toyota Land Cruiser 300",
];

const FAQ = [
  ["How long does an import take?", "Typically 6 to 10 weeks from deposit to handover, depending on the origin market, shipping schedules and port clearance."],
  ["Can I import a car older than 8 years?", "Kenya generally restricts imports to vehicles less than 8 years from the year of first registration. We'll check eligibility before you commit."],
  ["How is duty calculated?", "KRA uses its Current Retail Selling Price (CRSP) schedule for the model, then applies import duty, excise duty, VAT and levies. Our estimator gives a rough figure; we'll quote exactly."],
  ["Do I pay everything upfront?", "No. We agree a deposit to secure the car, with the balance due before shipping or clearance. Talk to us about the schedule."],
];

export default function ImportPage() {
  return (
    <section className="page import">
      <header className="page__head">
        <p className="eyebrow"><span className="line" /> Importation</p>
        <h1 className="h1">Your exact spec, <em>delivered</em> to Nairobi.</h1>
        <p className="page__lede">
          Japan, the UK, the UAE or Europe. We handle the whole chain, from finding the car to putting Kenyan plates on it.
        </p>
      </header>

      <ImportSteps />
      <Estimator />

      <div className="sourcing" data-reveal>
        <p className="eyebrow">Often requested</p>
        <div className="sourcing__chips">
          {POPULAR.map((s) => (
            <a key={s} href={waLink(`Hi RNN Motors, can you import a ${s} for me? I'd like to discuss spec and budget.`)} target="_blank" rel="noopener">{s} ↗</a>
          ))}
        </div>
      </div>

      <div className="faq" data-reveal-group>
        <h2 className="h3">Questions we get asked</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}<span aria-hidden="true">+</span></summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
