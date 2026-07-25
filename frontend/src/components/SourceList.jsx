import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
} from "lucide-react";

export default function SourceList({ sources = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border-2 border-[#2A9DF4] bg-[#FFFDF6] px-5 py-4 hover:border-[#0B7A33] transition"
      >

        <div className="flex items-center gap-3">

          <FileText
            size={18}
            className="text-[#0B7A33]"
          />

          <div className="text-left">

            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              References
            </p>

            <p className="font-semibold">
              {sources.length} Source{sources.length !== 1 ? "s" : ""}
            </p>

          </div>

        </div>

        {open ? (
          <ChevronDown size={20} />
        ) : (
          <ChevronRight size={20} />
        )}

      </button>

      {open && (

        <div className="mt-4 space-y-3">

          {sources.length === 0 ? (

            <div className="border-2 border-dashed border-neutral-300 p-5 text-neutral-500">
              No references available.
            </div>

          ) : (

            sources.map((source, index) => (

              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border-2 border-[#2A9DF4] bg-white px-5 py-4 hover:border-[#0B7A33] hover:translate-x-1 transition"
              >

                <div>

                  <p className="font-medium">
                    {source.title}
                  </p>

                  <p className="text-sm text-neutral-500 mt-1">
                    Source {index + 1}
                  </p>

                </div>

                <ExternalLink
                  size={18}
                  className="text-[#2A9DF4]"
                />

              </a>

            ))

          )}

        </div>

      )}

    </div>
  );
}
