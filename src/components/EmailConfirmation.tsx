"use client";

import { useAuth } from "@/lib/contexts";
import { getCurrentUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function EmailConfirmationHandler() {
  const { login: setUser } = useAuth();
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🚀 EmailConfirmationHandler mounted");
    console.log("🔍 Current URL:", window.location.href);
    console.log("🔍 Hash:", window.location.hash);

    // Parse hash fragment for Supabase tokens (e.g., #access_token=...&refresh_token=...)
    const hash = window.location.hash;

    if (!hash || hash.length <= 1) {
      console.log("❌ No hash found, exiting");
      return; // No hash, nothing to do
    }

    console.log("📧 Detected URL hash, checking for Supabase auth tokens");

    // Parse hash parameters
    const hashParams = new URLSearchParams(hash.substring(1)); // Remove the '#'
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const tokenType = hashParams.get("token_type");
    const type = hashParams.get("type");

    console.log("🔐 Hash params:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      tokenType,
      type,
    });

    if (accessToken && !isConfirming && !confirmError) {
      setIsConfirming(true);

      console.log("📧 Email confirmation detected, storing tokens...");

      // Store tokens in localStorage
      console.log("💾 Storing access_token in localStorage");
      localStorage.setItem("access_token", accessToken);

      if (refreshToken) {
        console.log("💾 Storing refresh_token in localStorage");
        localStorage.setItem("refresh_token", refreshToken);
      }

      // Fetch user data from backend using the new token
      console.log("👤 Fetching user data from backend...");
      getCurrentUser()
        .then((response) => {
          console.log("👤 User data response:", response);

          if (response.success && response.data?.user) {
            console.log(
              "✅ User data fetched successfully:",
              response.data.user
            );

            // Store user data in localStorage
            localStorage.setItem(
              "user_data",
              JSON.stringify(response.data.user)
            );

            // Set user in auth context
            setUser(response.data.user);

            console.log("🎉 Email confirmed and user logged in!");

            // Clean up the URL hash (but stay on the same page - don't redirect)
            if (window.history.replaceState) {
              window.history.replaceState(null, "", window.location.pathname);
            }

            // Mark confirmation as complete - page will re-render with authenticated user
            setIsConfirming(false);

            console.log(
              "✅ Email confirmation complete, user is now authenticated"
            );
          } else {
            console.error("❌ Failed to fetch user data:", response.error);
            setConfirmError("Failed to retrieve user information");
            setIsConfirming(false);

            // Clear invalid tokens
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching user data:", error);
          setConfirmError("Failed to retrieve user information");
          setIsConfirming(false);

          // Clear invalid tokens
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        });
    }
  }, [router, setUser, isConfirming, confirmError]);

  // Don't render anything - let the parent page handle the loading/error states
  return null;
}
