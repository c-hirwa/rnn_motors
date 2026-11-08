"use client";

import { useTransition } from "react";
import { ENQUIRY_STATUSES } from "@/lib/format";
import { deleteEnquiry, setEnquiryStatus } from "../../actions";

export default function EnquiryActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <div className={`enq__actions ${pending ? "is-busy" : ""}`}>
      {Object.entries(ENQUIRY_STATUSES)
        .filter(([k]) => k !== status)
        .map(([k, v]) => (
          <button key={k} className="abtn abtn--ghost" onClick={() => start(() => setEnquiryStatus(id, k))}>
            Mark {v.toLowerCase()}
          </button>
        ))}
      <button
        className="abtn abtn--ghost danger"
        onClick={() => confirm("Delete this enquiry?") && start(() => deleteEnquiry(id))}
      >
        Delete
      </button>
    </div>
  );
}
