"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/app/components/ui/ui/Container";
import { getProfile, getStoredUser, logoutUser } from "@/services/authService";

export default function UserPage() {
  const router = useRouter();
  const storedUser = getStoredUser();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(storedUser);
  const [loading, setLoading] = useState(Boolean(storedUser));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    getProfile()
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch((profileError) => {
        setError(profileError instanceof Error ? profileError.message : "Unable to load profile from the server.");
      })
      .finally(() => setLoading(false));
  }, [router, storedUser]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#f8faf7] text-gray-900">
      <Container>
        <div className="mx-auto max-w-4xl py-16">
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white/95 p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">User dashboard</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">Welcome back</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Manage your profile, review current user details, and access the booking experience from one place.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleLogout} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-700 hover:text-green-700">Logout</button>
              <button type="button" onClick={() => router.push("/")} className="rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-green-900/20 transition hover:from-green-600 hover:to-green-500">Visit home</button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">Loading your profile...</div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
              <h2 className="text-xl font-semibold">Could not load profile</h2>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : (
            user && (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Profile</p>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="mt-2 text-sm text-gray-600">{user.email}</p>
                  <p className="mt-3 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">{user.role}</p>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Quick access</p>
                  <ul className="mt-5 space-y-4 text-sm text-gray-600">
                    <li>- View and manage your bookings</li>
                    <li>- Update your profile information</li>
                    <li>- Explore room availability</li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Next step</p>
                  <div className="mt-5 space-y-4 text-sm text-gray-600">
                    <p>Navigate to Home to continue browsing rooms and special offers.</p>
                    <p>Use the profile icon in the navbar for quick access anytime.</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </Container>
    </main>
  );
}
