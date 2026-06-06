interface SectionTitleProps {
  label: string;
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ label, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-100 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-teal-300/30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-200" />
        </span>
        {label}
      </span>

      <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-100 md:text-5xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">{subtitle}</p>
      )}
    </div>
  );
}
