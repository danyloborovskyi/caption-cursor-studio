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
      <div className="min-h-screen p-8">
        <main className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Caption Cursor Studio</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Generate AI-powered captions for your images instantly
            </p>
          </div>

          <div className="mb-12">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">
                  🤖 AI Caption Generator
                </CardTitle>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Upload single images or batch process up to 3 images at once
                </p>
              </CardHeader>
              <CardContent>
                <UploadTabs />
              </CardContent>
            </Card>
          </div>

          {/* Photo Gallery Section */}
          <div className="mb-12">
            <PhotoGallery />
          </div>
        </main>
      </div>
    </GalleryProvider>
  );
}
