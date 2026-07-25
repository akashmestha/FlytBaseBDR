import {
  Brain,
  Building2,
  Search,
  Users,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const stages = [
  {
    title: "ICP",
    subtitle: "Identify Target Profile",
    icon: Brain,
    color: "text-purple-600",
  },
  {
    title: "Discovery",
    subtitle: "Find Companies",
    icon: Building2,
    color: "text-blue-600",
  },
  {
    title: "Research",
    subtitle: "Analyze Accounts",
    icon: Search,
    color: "text-amber-600",
  },
  {
    title: "Contacts",
    subtitle: "Decision Makers",
    icon: Users,
    color: "text-cyan-600",
  },
  {
    title: "Outreach",
    subtitle: "Generate Emails",
    icon: Mail,
    color: "text-green-600",
  },
];

export default function Pipeline() {
  return (
    <div className="flyt-card p-7 mb-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Multi-Agent Workflow
          </p>

          <h2
            className="pixel text-[#0B7A33] mt-2"
            style={{ fontSize: "16px" }}
          >
            EXECUTION PIPELINE
          </h2>

        </div>

        <div className="border-2 border-[#0B7A33] px-4 py-2 text-xs uppercase tracking-widest text-[#0B7A33] font-semibold">
          READY
        </div>

      </div>

      <div className="grid grid-cols-5 gap-5">

        {stages.map((stage, index) => {

          const Icon = stage.icon;

          return (

            <div
              key={stage.title}
              className="relative"
            >

              <div
                className="
                border-2
                border-[#2A9DF4]
                bg-white
                p-5
                h-full
                hover:border-[#0B7A33]
                transition
                "
              >

                <div
                  className="
                  w-12
                  h-12
                  rounded-full
                  bg-[#F7F2E8]
                  flex
                  items-center
                  justify-center
                  mb-5
                  "
                >

                  <Icon
                    size={22}
                    className={stage.color}
                  />

                </div>

                <p className="pixel text-[#0B7A33] text-[11px] mb-4">
                  {stage.title.toUpperCase()}
                </p>

                <p className="text-sm leading-6 text-neutral-600">
                  {stage.subtitle}
                </p>

              </div>

              {index !== stages.length - 1 && (

                <ArrowRight
                  size={22}
                  className="
                    absolute
                    -right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#2A9DF4]
                  "
                />

              )}

            </div>

          );

        })}

      </div>

      <div className="mt-8 border-t border-neutral-300 pt-5 flex justify-between text-sm">

        <span className="text-neutral-600">
          Agent Count
        </span>

        <span className="font-semibold">
          5 Autonomous Agents
        </span>

      </div>

    </div>
  );
}