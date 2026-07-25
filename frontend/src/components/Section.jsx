export default function Section({
  Icon,
  title,
  children,
}) {
  return (
    <div
      className="
        border-2
        border-[#2A9DF4]
        bg-[#FFFDF6]
        p-6
        h-full
        transition
        hover:border-[#0B7A33]
        hover:-translate-y-1
      "
    >
      <div className="flex items-center gap-3 mb-5">

        <Icon
            size={18}
            className="text-[#0B7A33]"
        />

        <div>

          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Research
          </p>

          <h3
            className="pixel text-[#0B7A33]"
            style={{
              fontSize: "13px",
              lineHeight: "1.5",
            }}
          >
            {title.toUpperCase()}
          </h3>

        </div>

      </div>

      <div className="space-y-3 leading-7 text-neutral-700">
        {children}
      </div>

    </div>
  );
}
