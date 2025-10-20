"use client";

import React from "react";
import { Hero } from "./Hero";
import { AuthSection } from "./AuthSection";
import { useAuth } from "@/lib/contexts";
import { Button } from "./Button";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const scrollToApp = () => {
    const appSection = document.getElementById("app-section");
    if (appSection) {
      appSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
            <Button
              onClick={scrollToApp}
              variant="primary"
              size="lg"
              className="px-12"
            >
              Go to Upload
            </Button>
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
