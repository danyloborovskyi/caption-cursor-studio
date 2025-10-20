"use client";

import { Header, Card, CardContent, UploadTabs } from "@/components";
import { GalleryProvider, AuthProvider, useAuth } from "@/lib/contexts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function UploadPageContent() {
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

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upload Your Images
          </h1>
          <p className="text-white/70 text-lg">
            Upload single or multiple images and get AI-powered captions and
            tags
          </p>
        </div>

        {/* Upload Section */}
        <section className="mb-24">
          <Card as="article" className="max-w-4xl mx-auto">
            <CardContent as="main" role="application">
              <UploadTabs />
            </CardContent>
          </Card>
        </section>

        {/* Quick Links */}
        <div className="text-center">
          <p className="text-white/60 mb-4">
            Want to view your uploaded images?
          </p>
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Go to Gallery
          </a>
        </div>
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <AuthProvider>
      <GalleryProvider>
        <UploadPageContent />
      </GalleryProvider>
    </AuthProvider>
  );
}
