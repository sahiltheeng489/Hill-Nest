"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginUser, registerUser } from "@/services/authService";

type AuthFormProps = {
  mode: "login" | "register";
};

const features = [
  { icon: "🏔️", text: "Stunning mountain views" },
  { icon: "☕", text: "Complimentary breakfast daily" },
  { icon: "🛜", text: "High-speed Wi-Fi everywhere" },
  { icon: "✅", text: "Free cancellation policy" },
];

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devVerificationUrl, setDevVerificationUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = searchParams.get("next");
  const safeNextPath = nextPath && nextPath.startsWith("/") ? nextPath : null;
  const postAuthPath = safeNextPath || (isRegister ? "/" : "/user");
  const switchModeHref = `${isRegister ? "/login" : "/register"}${safeNextPath ? `?next=${encodeURIComponent(safeNextPath)}` : ""}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setDevVerificationUrl("");
    setIsSubmitting(true);
    try {
      if (isRegister) {
        const data = await registerUser({ name, email, password });
        setSuccess("Account created. Verify your email to unlock the full account flow.");
        setDevVerificationUrl(data.emailVerification?.devUrl || "");
      } else {
        await loginUser({ email, password });
        router.push(postAuthPath);
        router.refresh();
      }
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* ── Left panel — hero image with overlay ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/hero.png"
          alt="HillNest Homestay"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-green-950/50 to-black/60" />

        {/* Left panel content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">🌿</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Hill<span className="text-green-400">Nest</span>
            </span>
          </Link>

          {/* Central quote */}
          <div className="animate-slide-in-left delay-200">
            <h2 className="font-serif text-4xl font-bold text-white leading-snug">
              Your perfect<br />
              <span className="text-green-400">mountain escape</span><br />
              awaits you.
            </h2>
            <p className="mt-4 text-gray-300 text-sm leading-relaxed max-w-xs">
              Sign in to manage your bookings, explore rooms, and plan your next stay at HillNest.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-3">
              {features.map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-base flex-shrink-0">
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom testimonial */}
          <div className="glass rounded-2xl p-5 animate-fade-up delay-400">
            <p className="text-sm text-gray-200 italic leading-relaxed">
              &ldquo;Absolutely magical stay! The valley views and warm hospitality made it unforgettable.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Priya Sharma</p>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f8faf8]">
        <div className="w-full max-w-md animate-scale-in">

          {/* Mobile brand */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Hill<span className="text-green-700">Nest</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {isRegister ? "New Account" : "Welcome Back"}
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold text-gray-900">
              {isRegister ? "Create your account" : "Sign in to HillNest"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {isRegister
                ? "Join HillNest to manage bookings and plan your perfect stay."
                : "Enter your credentials to access your dashboard."}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name (register only) */}
              {isRegister && (
                <div className="animate-fade-up">
                  <label htmlFor="auth-name" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Priya Sharma"
                    className="input-base"
                  />
                </div>
              )}

              {/* Email */}
              <div className="animate-fade-up delay-100">
                <label htmlFor="auth-email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-base"
                />
              </div>

              {/* Password */}
              <div className="animate-fade-up delay-200">
                <label htmlFor="auth-password" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="input-base pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700 transition-colors text-sm"
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-fade-up">
                  <span className="text-base flex-shrink-0">⚠️</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  <p>{success}</p>
                  {devVerificationUrl ? (
                    <a
                      href={devVerificationUrl}
                      className="mt-2 inline-flex font-semibold text-green-900 underline underline-offset-2"
                    >
                      Open development verification link
                    </a>
                  ) : null}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isRegister
                    ? "Create account"
                    : "Login"}
              </button>

              {/* Switch mode */}
              <p className="mt-6 text-center text-sm text-gray-500">
                {isRegister ? "Already have an account?" : "New to HillNest?"}{" "}
                <Link
                  href={switchModeHref}
                  className="font-semibold text-green-700 hover:text-green-800 hover:underline underline-offset-2 transition-colors"
                >
                  {isRegister ? "Sign in" : "Create an account"}
                </Link>
              </p>
            </form>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to HillNest
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
