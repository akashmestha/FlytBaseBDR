import { useState } from "react";

export default function CampaignForm({ onRun, loading }) {
  const [vertical, setVertical] = useState(
    "Large-scale lithium, copper and iron ore mining operations in Latin America"
  );

  const [referenceCompany, setReferenceCompany] = useState("SQM");

  return (
    <div className="flyt-card p-8">

      {/* Header */}

      <p className="text-xs uppercase tracking-[0.25em] text-neutral-600 mb-3">
        Mission Configuration
      </p>

      <h2
        className="pixel text-[#0B7A33] mb-8"
        style={{
          fontSize: "20px",
          lineHeight: "1.5",
        }}
      >
        CAMPAIGN
        <br />
        BRIEF
      </h2>

      {/* Target Vertical */}

      <div className="mb-7">

        <label className="block mb-3 text-xs tracking-[0.18em] uppercase text-neutral-700">
          Target Vertical
        </label>

        <textarea
          rows={5}
          value={vertical}
          onChange={(e) => setVertical(e.target.value)}
          className="
            w-full
            bg-[#F7F2E8]
            border-2
            border-[#2A9DF4]
            px-4
            py-4
            resize-none
            outline-none
            focus:border-[#0B7A33]
            transition
            leading-7
          "
        />

      </div>

      {/* Company */}

      <div className="mb-8">

        <label className="block mb-3 text-xs tracking-[0.18em] uppercase text-neutral-700">
          Reference Company
        </label>

        <input
          value={referenceCompany}
          onChange={(e) => setReferenceCompany(e.target.value)}
          className="
            w-full
            bg-[#F7F2E8]
            border-2
            border-[#2A9DF4]
            px-4
            py-4
            outline-none
            focus:border-[#0B7A33]
            transition
          "
        />

      </div>

      {/* Button */}

      <button
        disabled={loading}
        onClick={() =>
          onRun({
            vertical,
            reference_company: referenceCompany,
          })
        }
        className="
          flyt-button
          pixel
          w-full
          py-5
          text-black
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
        style={{
          fontSize: "13px",
        }}
      >
        {loading ? "PROCESSING..." : "RUN CAMPAIGN"}
      </button>

    </div>
  );
}
