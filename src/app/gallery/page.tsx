"use client";

import { Gallery } from "@/components";
import { useAuth } from "@/lib/contexts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GalleryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-white mb-4 tracking-wide">
          Your Image Gallery
        </h1>
        <p className="text-white/70 font-light text-lg">
          Browse, search, and manage your AI-analyzed images
        </p>
      </div>

      {/* Gallery Section */}
      <section className="mb-16">
        <Gallery />
      </section>
    </main>
  );
}
