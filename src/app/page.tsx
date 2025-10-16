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
          <div className="mb-24">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-3xl">
                  🤖 AI Caption Generator
                </CardTitle>
                <p className="text-center text-white/70 font-light mt-4 text-lg">
                  Upload single images or batch process up to 3 images at once
                </p>
              </CardHeader>
              <CardContent>
                <UploadTabs />
              </CardContent>
            </Card>
          </div>

          {/* Photo Gallery Section */}
          <div className="mb-16">
            <PhotoGallery />
          </div>
        </main>
      </div>
    </GalleryProvider>
  );
}
