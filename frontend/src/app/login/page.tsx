import { Suspense } from "react";
import AuthForm from "@/app/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[linear-gradient(180deg,#04151A,#092828)]" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
