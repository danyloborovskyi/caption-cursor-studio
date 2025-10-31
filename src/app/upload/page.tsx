"use client";

import { EmailConfirmationHandler } from "@/components";
import { BulkUpload } from "@/components/ui/BulkUpload";
import { MyGallery } from "@/components/ui/MyGallery";
import { useAuth } from "@/lib/contexts";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

export default function UploadPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Check if there's a hash (email confirmation tokens)
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      console.log(
        "🔐 Hash detected on upload page, processing email confirmation"
      );
      setIsProcessingAuth(true);
      return;
    }

    if (!isLoading && !isAuthenticated && !isProcessingAuth) {
      // No auth and not processing, redirect to home
      router.push("/");
    }
  }, [isAuthenticated, isLoading, isProcessingAuth, router]);

  // When user becomes authenticated, clear the processing flag
  useEffect(() => {
    if (isAuthenticated && isProcessingAuth) {
      console.log("✅ User authenticated, clearing processing flag");
      setIsProcessingAuth(false);
    }
  }, [isAuthenticated, isProcessingAuth]);

  if (isLoading || isProcessingAuth) {
    return (
      <>
        <Suspense fallback={null}>
          <EmailConfirmationHandler />
        </Suspense>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">
            {isProcessingAuth ? "Confirming your email..." : "Loading..."}
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12 md:py-16">
      {/* Page Title */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2 sm:mb-4 tracking-wide">
          Upload Your Images
        </h1>
        <p className="text-white/70 font-light text-sm sm:text-base md:text-lg px-2">
          Upload multiple images and get AI-powered captions and tags
        </p>
      </div>

      {/* Upload Section */}
      <section className="mb-8 sm:mb-12 md:mb-16 max-w-5xl mx-auto">
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <BulkUpload
            onUploadSuccess={() => {
              console.log("Upload completed successfully!");
              // Refresh the gallery to show newly uploaded images
              setRefreshKey((prev) => prev + 1);
            }}
          />
        </div>
      </section>

      {/* My Gallery Section - Shows user's uploaded images */}
      <section className="mb-8 sm:mb-12 md:mb-16">
        <MyGallery key={refreshKey} />
      </section>
    </main>
  );
}
