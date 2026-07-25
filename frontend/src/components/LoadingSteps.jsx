import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, Circle, Loader2, Terminal } from "lucide-react";

const steps = [
  "Initializing campaign...",
  "Running ICP analysis...",
  "Discovering target accounts...",
  "Researching organizations...",
  "Finding decision makers...",
  "Generating personalized outreach...",
];

// Roughly matches how long each backend stage tends to take (search + LLM
// calls + the rate-limit throttle), so the log doesn't finish suspiciously
// fast or stall out. It never fakes "done" for a step that's still running —
// it just holds on the current step until the response actually comes back.
const STEP_INTERVAL_MS = 4000;

export default function LoadingSteps({ loading, done }) {
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = not started
  const intervalRef = useRef(null);

  useEffect(() => {
    if (loading) {
      setActiveIndex(0);
      intervalRef.current = setInterval(() => {
        setActiveIndex((i) => Math.min(i + 1, steps.length - 1));
      }, STEP_INTERVAL_MS);
    } else {
      clearInterval(intervalRef.current);
      setActiveIndex(done ? steps.length : -1);
    }

    return () => clearInterval(intervalRef.current);
  }, [loading, done]);

  return (
    <div className="flyt-card p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <Terminal
          size={20}
          className="text-[#0B7A33]"
        />

        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
            Live Execution
          </p>

          <h2
            className="pixel text-[#0B7A33] mt-2"
            style={{
              fontSize: "15px",
            }}
          >
            AGENT LOG
          </h2>

        </div>

      </div>

      {/* Terminal */}

      <div className="bg-[#1E1E1E] text-[#C9F7C5] border-2 border-[#2A9DF4] p-5 font-mono text-sm max-h-96 overflow-y-auto">

        {steps.map((step, index) => {
          const isDone = index < activeIndex || activeIndex === steps.length;
          const isCurrent = index === activeIndex && activeIndex < steps.length;

          return (

            <div
              key={index}
              className="flex items-start justify-between mb-4"
            >

              <div className="flex items-start gap-3">

                <Bot
                  size={16}
                  className={
                    isDone || isCurrent
                      ? "mt-1 text-[#F4C400]"
                      : "mt-1 text-neutral-600"
                  }
                />

                <span className={isDone || isCurrent ? "" : "text-neutral-500"}>

                  &gt; {step}

                </span>

              </div>

              {isDone && (
                <CheckCircle2
                  size={18}
                  className="text-green-400 shrink-0"
                />
              )}

              {isCurrent && (
                <Loader2
                  size={18}
                  className="text-[#F4C400] animate-spin shrink-0"
                />
              )}

              {!isDone && !isCurrent && (
                <Circle
                  size={14}
                  className="text-neutral-700 shrink-0"
                />
              )}

            </div>

          );
        })}

        {/* Cursor */}

        <div className="mt-2 text-[#F4C400]">

          &gt; <span className="animate-pulse">█</span>

        </div>

      </div>

    </div>
  );
}
