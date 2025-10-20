"use client";

import {
  Header,
  Card,
  CardContent,
  UploadTabs,
  PhotoGallery,
} from "@/components";
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

      <main className="max-w-7xl mx-auto px-4 py-16">
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
        <section className="mb-16">
          <Card as="article" className="max-w-4xl mx-auto">
            <CardContent as="main" role="application">
              <UploadTabs />
            </CardContent>
          </Card>
        </section>

        {/* Divider */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="border-t border-white/10"></div>
        </div>

        {/* Recent Uploads Section */}
        <section className="mb-16" aria-label="Recent Uploads">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Images</h2>
            <p className="text-white/60">
              View and manage your recently uploaded images
            </p>
          </div>
          <PhotoGallery />
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
