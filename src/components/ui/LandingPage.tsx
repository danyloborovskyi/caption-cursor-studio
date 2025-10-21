"use client";

import React from "react";
import { Hero } from "./Hero";
import { useAuth } from "@/lib/contexts";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* CTA Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-12 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Get Started Today
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Sign up now to start generating AI-powered captions for your
              images
            </p>
            <p className="text-white/60 text-sm">
              Already have an account? Click the login button in the header to
              get started.
            </p>
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
