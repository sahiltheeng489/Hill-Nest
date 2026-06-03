import { Suspense } from "react";
import BookingPageClient from "./BookingPageClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <BookingPageClient />
    </Suspense>
  );
}
