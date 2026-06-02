import { Suspense } from "react";
import AuthForm from "@/app/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f8faf8]" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
