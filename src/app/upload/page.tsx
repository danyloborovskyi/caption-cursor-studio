"use client";

import { Gallery, EmailConfirmationHandler } from "@/components";
import { BulkUpload } from "@/components/ui/BulkUpload";
import { useAuth } from "@/lib/contexts";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

export default function UploadPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

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
    <main className="max-w-7xl mx-auto px-4 py-16">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-white mb-4 tracking-wide">
          Upload Your Images
        </h1>
        <p className="text-white/70 font-light text-lg">
          Upload multiple images and get AI-powered captions and tags
        </p>
      </div>

      {/* Upload Section */}
      <section className="mb-16 max-w-5xl mx-auto">
        <div className="glass rounded-2xl p-8">
          <BulkUpload
            onUploadSuccess={() => {
              console.log("Upload completed successfully!");
            }}
          />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="mb-16">
        <Gallery />
      </section>
    </main>
  );
}
