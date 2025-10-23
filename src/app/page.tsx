"use client";

import { LandingPage } from "@/components";
import { useAuth } from "@/lib/contexts";

export default function Home() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <LandingPage />;
}
