"use client";

import { Header, Gallery } from "@/components";
import { BulkUpload } from "@/components/ui/BulkUpload";
import { AuthProvider, GalleryProvider, useAuth } from "@/lib/contexts";
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

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-white mb-4 tracking-wide">
            Upload Your Images
          </h1>
          <p className="text-white/70 font-light text-lg">
            Upload multiple images and get AI-powered captions and tags
          </p>
        </div>

        {/* Upload Section */}
        <section className="mb-16 max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-8">
            <BulkUpload
              onUploadSuccess={() => {
                console.log("Upload completed successfully!");
              }}
            />
          </div>
        </section>

        {/* Gallery Section */}
        <section className="mb-16">
          <Gallery />
        </section>

        {/* Divider */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="border-t border-white/10"></div>
        </div>

        {/* Info Section */}
        <section className="max-w-3xl mx-auto">
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-light text-white mb-4">How it works</h2>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong className="text-white">Select images:</strong> Upload
                  up to 10 images at once
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong className="text-white">AI Analysis:</strong> Our AI
                  automatically generates descriptions and tags
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong className="text-white">Ready to use:</strong> Your
                  images are processed and ready within seconds
                </span>
              </li>
            </ul>
          </div>
        </section>
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
