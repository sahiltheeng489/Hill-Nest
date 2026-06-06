'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../../services/adminApi';
import { useAdminStore } from '../../../store/adminStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAdminStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminLogin({ email, password, ...(showMfa ? { mfaCode } : {}) });
      const data = res.data;

      if (data.requiresMfa) {
        setShowMfa(true);
        setLoading(false);
        return;
      }

      if (data.accessToken && data.user) {
        localStorage.setItem('admin_access_token', data.accessToken);
        setUser(data.user);
        router.replace('/admin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[linear-gradient(135deg,#04151A_0%,#092828_50%,#04151A_100%)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#325F57]/16 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#6F9487]/12 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.92),rgba(9,40,40,0.78))] shadow-[0_24px_80px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
          {/* Header gradient */}
          <div className="h-2 bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487]" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#163E3C] via-[#325F57] to-[#6F9487] shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-white">HillNest Admin</h1>
              <p className="text-white/60 text-sm mt-1">
                {showMfa ? 'Enter your MFA verification code' : 'Sign in to the admin portal'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!showMfa ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/75">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="admin@hillnest.in"
                      className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/20 focus:border-[#6F9487]/50 transition-all backdrop-blur-md"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/75">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/20 focus:border-[#6F9487]/50 transition-all backdrop-blur-md"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white">
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/75">6-digit MFA code</label>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-teal-200/20 focus:border-[#6F9487]/50 transition-all backdrop-blur-md"
                    autoFocus
                  />
                  <p className="mt-1.5 text-xs text-white/45">Enter the code from your authenticator app</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                {showMfa ? 'Verify code' : 'Sign in'}
              </button>

              {showMfa && (
                <button type="button" onClick={() => { setShowMfa(false); setMfaCode(''); }} className="w-full text-sm font-medium text-white/65 transition-colors hover:text-white">
                  ← Back to login
                </button>
              )}
            </form>

            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <a href="#" className="text-xs text-white/45 transition-colors hover:text-white">Forgot password?</a>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">
          Protected area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
