"use client";

import React from "react";
import { Hero } from "./Hero";
import { AuthSection } from "./AuthSection";
import { useAuth } from "@/lib/contexts";
import { useRouter } from "next/navigation";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Auth Section (only show if not authenticated) */}
      {!isAuthenticated && <AuthSection />}

      {/* CTA Section (show if authenticated) */}
      {isAuthenticated && (
        <section className="py-12 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Welcome back! Ready to get started?
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Upload your images and let AI do the magic
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/upload")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors shadow-lg"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload Images
              </button>
              <button
                onClick={() => router.push("/gallery")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors"
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
                View Gallery
              </button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Upload Images
              </h3>
              <p className="text-white/60 text-lg">
                Select single or multiple images from your device
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                AI Analysis
              </h3>
              <p className="text-white/60 text-lg">
                Our AI analyzes and generates descriptions and tags
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                View & Manage
              </h3>
              <p className="text-white/60 text-lg">
                Browse, search, and manage your captioned images
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
