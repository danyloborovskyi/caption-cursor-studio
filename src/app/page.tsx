"use client";

import { Header, LandingPage } from "@/components";
import { GalleryProvider, AuthProvider, useAuth } from "@/lib/contexts";

function HomeContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <Header />

      {/* Landing Page with Hero, Auth, and How It Works */}
      <LandingPage />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <GalleryProvider>
        <HomeContent />
      </GalleryProvider>
    </AuthProvider>
  );
}
