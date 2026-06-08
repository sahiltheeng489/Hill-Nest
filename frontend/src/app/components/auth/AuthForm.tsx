"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/services/authService";

type AuthFormProps = {
  mode: "login" | "register";
};

const shellClass =
  "relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#04151A_0%,#092828_52%,#04151A_100%)]";
const overlayClass =
  "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(111,148,135,0.16),transparent_30%),radial-gradient(circle_at_75%_20%,rgba(50,95,87,0.18),transparent_28%),linear-gradient(180deg,rgba(4,21,26,0.42)_0%,rgba(4,21,26,0.78)_100%)]";
const cardClass =
  "relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.58),rgba(9,40,40,0.36))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.36)] backdrop-blur-md sm:p-8 lg:p-10";
const inputClass =
  "input-base border-white/10 bg-white/8 text-white placeholder:text-slate-400 backdrop-blur-xl focus:border-teal-300/40 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.1)]";

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
  const safeNextPath =
    nextPath &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("/login") &&
    !nextPath.startsWith("/register")
      ? nextPath
      : null;
  const postAuthPath = safeNextPath || (isRegister ? "/" : "/user");
  const switchModeHref = `${isRegister ? "/login" : "/register"}${safeNextPath ? `?next=${encodeURIComponent(safeNextPath)}` : ""}`;

  useEffect(() => {
    router.prefetch(postAuthPath);
  }, [postAuthPath, router]);

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
        const data = await loginUser({ email, password });
        const nextDestination = safeNextPath || (data.user.role === "admin" ? "/admin" : "/user");

        setSuccess("Login successful. Opening your dashboard...");
        window.setTimeout(() => {
          router.replace(nextDestination);
        }, 250);
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

  const Shell = (
    <main className={shellClass}>
      <Image
        src="/cabin2.webp"
        alt="HillNest cabin"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className={overlayClass} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className={cardClass}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-black tracking-tight text-white">
              HillNest
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
              {isRegister ? "Create account" : "Sign in"}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
              {isRegister ? "Join us" : "Welcome back"}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              {isRegister ? "Create your account" : "Sign in to HillNest"}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
              {isRegister
                ? "Join HillNest and plan your perfect stay."
                : "Enter your credentials to access your dashboard and manage your stay."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister ? (
              <div className="animate-fade-up">
                <label htmlFor="auth-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-200">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Priya Sharma"
                  className={inputClass}
                />
              </div>
            ) : null}

            <div className={`animate-fade-up ${isRegister ? "delay-100" : ""}`}>
              <label htmlFor={isRegister ? "auth-email" : "auth-email"} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-200">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className={`animate-fade-up ${isRegister ? "delay-200" : "delay-100"}`}>
              <label htmlFor="auth-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-200">
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
                  className="input-base pr-12 border-white/10 bg-white/8 text-white placeholder:text-slate-400 backdrop-blur-xl focus:border-teal-300/40 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-50 backdrop-blur-md animate-fade-up">
                <span className="text-base flex-shrink-0">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-teal-300/20 bg-teal-500/10 px-4 py-3 text-sm text-teal-50 backdrop-blur-md">
                <p>{success}</p>
                {devVerificationUrl ? (
                  <a
                    href={devVerificationUrl}
                    className="mt-2 inline-flex font-semibold text-teal-100 underline underline-offset-2"
                  >
                    Open development verification link
                  </a>
                ) : null}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-teal-500/90 via-teal-500/90 to-slate-500/90 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,23,42,0.24)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            </button>

            <p className="pt-2 text-center text-sm text-slate-300">
              {isRegister ? "Already have an account? " : "New to HillNest? "}
              <Link
                href={switchModeHref}
                className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:text-teal-100 hover:decoration-teal-100"
              >
                {isRegister ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </form>

          <div className="relative z-10 mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to HillNest
            </Link>
          </div>
        </div>
      </div>
    </main>
  );

  return Shell;
}
