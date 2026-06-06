import { Suspense } from "react";
import BookingPageClient from "./BookingPageClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[linear-gradient(180deg,#04151A,#092828)]" />}>
      <BookingPageClient />
    </Suspense>
  );
}
