"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  UploadTabs,
  PhotoGallery,
} from "@/components";
import { GalleryProvider } from "@/lib/contexts";

export default function Home() {
  return (
    <GalleryProvider>
      <div className="min-h-screen px-4 py-16 relative">
        <main className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-20">
            <h1 className="text-6xl font-extralight text-white mb-6 tracking-tight">
              Caption Cursor Studio
            </h1>
            <p className="text-xl font-light text-white/80 max-w-2xl mx-auto leading-relaxed">
              Transform your images with AI-powered captions using our
              beautiful, intuitive interface
            </p>
          </div>

          {/* Upload Section */}
          <section className="mb-24">
            <Card
              as="article"
              className="max-w-4xl mx-auto"
              aria-labelledby="upload-section-title"
              aria-describedby="upload-section-description"
            >
              <CardHeader>
                <CardTitle
                  as="h2"
                  id="upload-section-title"
                  className="text-center text-3xl"
                >
                  🤖 AI Caption Generator
                </CardTitle>
                <p
                  id="upload-section-description"
                  className="text-center text-white/70 font-light mt-4 text-lg"
                >
                  Upload single images or batch process up to 3 images at once
                </p>
              </CardHeader>
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
  );
}
