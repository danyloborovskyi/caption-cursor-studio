"use client";

import Image from "next/image";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ImageUpload,
} from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Image
            className="mx-auto mb-8 dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-4xl font-bold mb-4">Caption Cursor Studio</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            A Next.js TypeScript project built with modern tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>⚡ Next.js 15</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Latest version with App Router, Server Components, and improved
                performance.
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
                📸 Upload Your Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImageSelect={(file) => {
                  console.log("Selected file:", file.name);
                }}
              />
            </CardContent>
          </Card>
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
            Edit{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
              src/app/page.tsx
            </code>{" "}
            to start building your app.
          </p>
        </div>
      </main>
    </div>
  );
}
