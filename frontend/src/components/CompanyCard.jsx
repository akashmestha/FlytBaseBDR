import { useState } from "react";
import Section from "./Section";
import SourceList from "./SourceList";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Mail,
  CheckCircle2,
  Cpu,
  Leaf,
  TriangleAlert,
  FileText,
} from "lucide-react";

// The research model doesn't always follow the "array of strings" schema —
// sometimes it returns objects like {title, date, content} instead. This
// renders whatever shape shows up without crashing.
function itemToText(item) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    return Object.values(item).filter(Boolean).join(" — ");
  }
  return String(item);
}

export default function CompanyCard({ company }) {
  const research = company.research;
  const [selectedEmail, setSelectedEmail] = useState(0);

  return (
    <div className="flyt-card overflow-hidden">

      {/* ================= HEADER ================= */}

      <div className="border-b-2 border-[#2A9DF4] px-8 py-6 flex justify-between items-start">

        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
            Target Profile
          </p>

          <h2
            className="pixel text-[#0B7A33] mt-3"
            style={{
              fontSize: "22px",
              lineHeight: "1.4",
            }}
          >
            {company.company.name.toUpperCase()}
          </h2>

          <div className="flex items-center gap-2 mt-4">

              <MapPin
                  size={16}
                  className="text-[#2A9DF4]"
              />

              {company.company.country}

          </div>

        </div>

        <div className="border-2 border-[#0B7A33] bg-green-50 px-5 py-3">

            <div className="flex items-center gap-2">

                <CheckCircle2
                    size={18}
                    className="text-[#0B7A33]"
                />

                <span className="text-xs uppercase tracking-widest">

                    HIGH CONFIDENCE

                </span>

            </div>

        </div>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="px-8 py-7 border-b border-neutral-300">

        <div className="flex items-center gap-3 mb-6">

            <Building2
                size={18}
                className="text-[#0B7A33]"
            />

            <h3 className="pixel text-[#0B7A33] text-sm">

                COMPANY INTELLIGENCE

            </h3>

        </div>

        <p className="leading-8 text-neutral-700">
          {research.summary}
        </p>

      </div>

      {/* ================= RESEARCH ================= */}

      <div className="grid md:grid-cols-2 gap-6 p-8">

        <Section
          title="Recent Initiatives"
          Icon={FileText}
        >
          <ul className="space-y-3">
            {research.recent_initiatives.map((item, i) => (
              <li key={i}>• {itemToText(item)}</li>
            ))}
          </ul>
        </Section>

        <Section
          title="Digital Transformation"
          Icon={Cpu}
        >
          <ul className="space-y-3">
            {research.digital_transformation.map((item, i) => (
              <li key={i}>• {itemToText(item)}</li>
            ))}
          </ul>
        </Section>

        <Section
          title="ESG"
          Icon={Leaf}
        >
          <ul className="space-y-3">
            {research.esg.map((item, i) => (
              <li key={i}>• {itemToText(item)}</li>
            ))}
          </ul>
        </Section>

        <Section
          title="Operational Challenges"
          Icon={TriangleAlert}
        >
          <ul className="space-y-3">
            {research.operational_challenges.map((item, i) => (
              <li key={i}>• {itemToText(item)}</li>
            ))}
          </ul>
        </Section>

      </div>

      {/* ================= CONTACT + EMAIL ================= */}

      {(company.contacts?.length > 0 || company.emails?.length > 0) && (

        <div className="grid lg:grid-cols-2 border-t border-neutral-300">

          {/* Contacts */}

          <div className="p-8 border-r border-neutral-300">

            <h3 className="pixel text-[#0B7A33] text-sm mb-6">
              DECISION MAKERS
            </h3>

            <div className="space-y-5">

              {company.contacts?.map((contact, i) => (

                <div
                  key={i}
                  className="border-2 border-[#2A9DF4] p-5"
                >

                  <h4 className="font-semibold text-lg">
                    {contact.name}
                  </h4>

                  <p className="text-neutral-600 mt-1">
                    {contact.title}
                  </p>

                  {contact.linkedin ? (
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2A9DF4] mt-3 inline-block"
                    >
                      View LinkedIn →
                    </a>
                  ) : (
                    <a
                      href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `${contact.name} ${company.company.name}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-500 mt-3 inline-block text-sm"
                    >
                      Search on LinkedIn →
                    </a>
                  )}

                </div>

              ))}

            </div>

          </div>

          {/* Email */}

          <div className="p-8">

            <h3 className="pixel text-[#0B7A33] text-sm mb-6">
              PERSONALIZED OUTREACH
            </h3>

            {company.emails?.length > 0 && (

              <>

                {company.emails.length > 1 && (

                  <div className="flex flex-wrap gap-2 mb-5">

                    {company.emails.map((email, i) => (

                      <button
                        key={i}
                        onClick={() => setSelectedEmail(i)}
                        className={`
                          text-xs px-3 py-2 border-2 transition
                          ${
                            i === selectedEmail
                              ? "border-[#0B7A33] bg-green-50 font-semibold"
                              : "border-[#2A9DF4] bg-white hover:border-[#0B7A33]"
                          }
                        `}
                      >
                        {email.contact}
                      </button>

                    ))}

                  </div>

                )}

                <div className="border-2 border-[#2A9DF4]">

                  <div className="border-b border-[#2A9DF4] px-5 py-4 bg-[#FFF8DC]">

                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                      Subject
                    </p>

                    <p className="font-semibold mt-2">
                      {company.emails[selectedEmail].subject}
                    </p>

                  </div>

                  <div className="p-5 whitespace-pre-wrap leading-8 text-neutral-700">
                    {company.emails[selectedEmail].body}
                  </div>

                </div>

              </>

            )}

          </div>

        </div>

      )}

      {/* ================= SOURCES ================= */}

      <div className="border-t border-neutral-300 p-8">

        <h3 className="pixel text-[#0B7A33] text-sm mb-5">
          REFERENCES
        </h3>

        <SourceList
          sources={company.sources}
        />

      </div>

    </div>
  );
}
