export default function MetricCard({
  title,
  value,
  color = "text-[#0B7A33]",
}) {
  // Numbers ("2", "8") stay big; longer text values ("Running", "Ready")
  // need a smaller size or they overflow the card at 28px in this font.
  const text = String(value);
  const fontSize = text.length > 2 ? "20px" : "28px";

  return (
    <div
      className="
        bg-[#FFFDF6]
        border-2
        border-[#2A9DF4]
        p-5
        flex
        flex-col
        justify-between
        min-h-[135px]
        overflow-hidden
        transition
        hover:-translate-y-1
        hover:border-[#0B7A33]
      "
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-600">
        {title}
      </p>

      <h2
        className={`pixel ${color} break-words`}
        style={{
          fontSize,
          lineHeight: "1.2",
        }}
      >
        {value}
      </h2>
    </div>
  );
}
