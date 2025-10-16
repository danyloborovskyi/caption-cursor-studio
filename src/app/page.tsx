"use client";

import {
  Button,
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>⚡ Next.js 15</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Latest version with App Router, Server Components, and
                  improved performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔷 TypeScript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Full type safety with strict mode enabled and proper
                  configuration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 Tailwind CSS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Utility-first CSS framework for rapid UI development.
                </p>
              </CardContent>
            </Card>
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

          <div className="text-center space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                View Docs
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Upload images above to see them appear in your photo gallery with
              AI-generated captions and tags!
            </p>
          </div>
        </main>
      </div>
    </GalleryProvider>
  );
}
