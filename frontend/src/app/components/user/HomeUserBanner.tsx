"use client";

import Link from "next/link";
import { getStoredUser } from "@/services/authService";

export default function HomeUserBanner() {
  const userName = getStoredUser()?.name || null;

  if (!userName) {
    return null;
  }

  return (
    <div className="mt-10 rounded-3xl border border-green-100 bg-green-50/70 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">Welcome back</p>
          <h3 className="mt-3 text-3xl font-bold text-gray-900">{userName}, your profile is ready.</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Continue to your personalized dashboard, check room availability, and manage your stay from one place.
          </p>
        </div>

        <Link
          href="/user"
          className="inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          Go to profile
        </Link>
      </div>
    </div>
  );
}
