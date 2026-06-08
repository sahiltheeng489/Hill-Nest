"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-white/14 text-white shadow-[0_16px_34px_rgba(2,6,23,0.18)] backdrop-blur-xl hover:bg-white/18 hover:shadow-[0_20px_40px_rgba(2,6,23,0.22)]",
    secondary:
      "bg-white/10 text-white backdrop-blur-md hover:bg-white/16",
    ghost:
      "bg-transparent text-slate-200 hover:bg-white/8",
    outline:
      "text-slate-100 bg-white/5 hover:bg-white/10",
  };

  const sizes = {
    sm:  "px-5 py-2 text-sm rounded-lg",
    md:  "px-7 py-3 text-sm rounded-xl",
    lg:  "px-9 py-4 text-base rounded-xl",
  };

  return (
    <button
      className={`animate-button-in font-semibold tracking-wide transition-all duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
