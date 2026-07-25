import { useState } from "react";

import CampaignForm from "../components/CampaignForm";
import LoadingSteps from "../components/LoadingSteps";
import CompanyCard from "../components/CompanyCard";
import MetricCard from "../components/MetricCard";
import Pipeline from "../components/Pipeline";
import api from "../services/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const runCampaign = async (payload) => {
    try {
      setLoading(true);

      const { data } = await api.post("/campaign/run", payload);

      // If your backend returns { "results": [...] }, change this to:
      // setResults(data.results);

      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Failed to run campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-neutral-800">
      <div className="max-w-[1650px] mx-auto px-10 py-8">
        {/* HEADER */}

        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-sm tracking-[0.3em] uppercase text-neutral-600 mb-4">
              FlytBase Internal Platform
            </p>

            <h1
              className="pixel text-[#0B7A33]"
              style={{
                fontSize: "42px",
                lineHeight: "1.35",
              }}
            >
              OUTBOUND AI
              <br />
              AGENT
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-neutral-700">
              AI-powered outbound sales intelligence platform that discovers
              enterprise accounts, researches organizations, identifies
              decision makers and generates personalized outreach.
            </p>
          </div>

          <div className="flyt-card p-6 w-70">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-600 mb-5">
              SYSTEM
            </p>

            <div className="space-y-3">
              <div>✓ FastAPI Backend</div>
              <div>✓ Groq LLM</div>
              <div>✓ Tavily Search</div>
              <div>✓ Multi-Agent Workflow</div>
            </div>
          </div>
        </div>

        {/* MAIN */}

        <div className="grid lg:grid-cols-12 gap-10">
          {/* LEFT */}

          <div className="lg:col-span-3 space-y-6">
            <CampaignForm onRun={runCampaign} loading={loading} />

            <LoadingSteps loading={loading} done={results.length > 0} />
          </div>

          {/* RIGHT */}

          <div className="lg:col-span-9">
            <Pipeline />

            {/* KPI */}

            <div className="flyt-card p-6 mb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                      System Overview
                    </p>

                    <h2
                      className="pixel text-[#0B7A33] mt-2"
                      style={{ fontSize: "18px" }}
                    >
                      MISSION STATUS
                    </h2>
                  </div>

                  <div className="px-4 py-2 bg-[#0B7A33] text-white text-xs uppercase tracking-[0.2em]">
                    Live
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <MetricCard title="Companies" value={results.length} />

                <MetricCard title="Research Reports" value={results.length} />

                <MetricCard
                  title="Contacts Found"
                  value={results.reduce(
                    (total, company) =>
                      total + (company.contacts?.length || 0),
                    0
                  )}
                />

                <MetricCard
                  title="Emails Generated"
                  value={results.reduce(
                    (total, company) =>
                      total + (company.emails?.length || 0),
                    0
                  )}
                />

                <MetricCard
                  title="Status"
                  value={loading ? "Running" : "Ready"}
                  color={
                    loading
                      ? "text-yellow-500"
                      : "text-green-700"
                  }
                />
              </div>
            </div>

            {/* RESULTS */}

            <div className="flyt-card p-8 space-y-8">
              {results.length === 0 ? (
                <div className="text-center py-24">
                  <h2 className="pixel text-[#0B7A33] text-lg mb-8">
                    READY
                  </h2>

                  <p className="max-w-xl mx-auto leading-8">
                    Configure the campaign on the left and click
                    <strong> Run Campaign</strong>.
                  </p>
                </div>
              ) : (
                results.map((company, index) => (
                  <CompanyCard key={index} company={company} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
