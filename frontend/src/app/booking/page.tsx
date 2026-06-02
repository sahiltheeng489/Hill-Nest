"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BookingRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(`/bookings${query ? `?${query}` : ""}`);
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-[#f5f7f5] pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500 text-sm">Redirecting to secure checkout...</p>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f7f5] pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500 text-sm">Opening secure checkout...</p>
          </div>
        </main>
      }
    >
      <BookingRedirectContent />
    </Suspense>
  );
}
