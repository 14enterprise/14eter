export default function Logo({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`font-black tracking-tighter text-white ${
        large ? "text-3xl" : "text-xl md:text-3xl"
      }`}
    >
      <span className="text-brand">14</span>Eter
      <span className="text-accent animate-pulse">.</span>
    </span>
  );
}
