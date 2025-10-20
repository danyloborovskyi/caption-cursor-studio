"use client";

import { Header, PhotoGallery } from "@/components";
import { GalleryProvider, AuthProvider, useAuth } from "@/lib/contexts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function GalleryPageContent() {
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
    <div className="min-h-screen relative">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Your Image Gallery
          </h1>
          <p className="text-white/70 text-lg">
            Browse, search, and manage your AI-captioned images
          </p>
        </div>

        {/* Photo Gallery Section */}
        <section className="mb-16" aria-label="Photo Gallery">
          <PhotoGallery />
        </section>

        {/* Quick Links */}
        <div className="text-center mt-12">
          <p className="text-white/60 mb-4">Want to upload more images?</p>
          <a
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload Images
          </a>
        </div>
      </main>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <AuthProvider>
      <GalleryProvider>
        <GalleryPageContent />
      </GalleryProvider>
    </AuthProvider>
  );
}
