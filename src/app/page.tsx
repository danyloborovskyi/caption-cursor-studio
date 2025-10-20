"use client";

import {
  Header,
  Card,
  CardContent,
  UploadTabs,
  PhotoGallery,
  LandingPage,
} from "@/components";
import { GalleryProvider, AuthProvider, useAuth } from "@/lib/contexts";

function HomeContent() {
  const { isAuthenticated, isLoading } = useAuth();

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

      {/* App Section (Upload & Gallery) - Only show if authenticated */}
      {isAuthenticated && (
        <main id="app-section" className="max-w-6xl mx-auto px-4 py-16">
          {/* Upload Section */}
          <section className="mb-24 mt-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Upload Your Images
            </h2>
            <Card as="article" className="max-w-4xl mx-auto">
              <CardContent as="main" role="application">
                <UploadTabs />
              </CardContent>
            </Card>
          </section>

          {/* Photo Gallery Section */}
          <section className="mb-16" aria-label="Photo Gallery">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Your Images
            </h2>
            <PhotoGallery />
          </section>
        </main>
      )}
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
