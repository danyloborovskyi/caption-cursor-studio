"use client";

import {
  Header,
  Card,
  CardContent,
  UploadTabs,
  PhotoGallery,
} from "@/components";
import { GalleryProvider, AuthProvider } from "@/lib/contexts";

export default function Home() {
  return (
    <AuthProvider>
      <GalleryProvider>
        <div className="min-h-screen relative">
          {/* Header */}
          <Header />

          <main className="max-w-6xl mx-auto px-4 py-16">
            {/* Upload Section */}
            <section className="mb-24 mt-12">
              <Card as="article" className="max-w-4xl mx-auto">
                <CardContent as="main" role="application">
                  <UploadTabs />
                </CardContent>
              </Card>
            </section>

            {/* Photo Gallery Section */}
            <section className="mb-16" aria-label="Photo Gallery">
              <PhotoGallery />
            </section>
          </main>
        </div>
      </GalleryProvider>
    </AuthProvider>
  );
}
