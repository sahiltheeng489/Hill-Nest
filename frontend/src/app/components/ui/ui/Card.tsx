interface CardProps {
  children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/8 shadow-[0_14px_30px_rgba(2,6,23,0.16)] transition-all duration-300 group hover:-translate-y-3 hover:bg-white/12 backdrop-blur-md">
      {children}
    </div>
  );
}
