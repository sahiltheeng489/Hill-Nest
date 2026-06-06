interface SectionTitleProps {
  label: string;
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ label, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-green-200/80 bg-white/65 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-green-700 shadow-[0_10px_28px_rgba(22,101,52,0.08)] backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        {label}
      </span>

      <h2 className="mt-5 font-serif text-4xl font-bold leading-tight tracking-normal text-gray-900 md:text-5xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
