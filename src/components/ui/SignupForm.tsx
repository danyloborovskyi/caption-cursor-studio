"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { signup } from "@/lib/api";
import { useAuth } from "@/lib/contexts";
import { useRouter } from "next/navigation";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect to login after 10 seconds
  useEffect(() => {
    if (showEmailConfirmation && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showEmailConfirmation && countdown === 0) {
      // Switch to login form
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    }
  }, [showEmailConfirmation, countdown, onSwitchToLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await signup({ email, password, username });

      if (response.success && response.data?.user) {
        // Show email confirmation notice instead of redirecting
        setShowEmailConfirmation(true);
        setCountdown(10);
        // Don't set user or redirect - user needs to confirm email first
        // setUser(response.data.user);
        // router.push("/upload");
      } else {
        setError(response.error || "Failed to sign up");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {showEmailConfirmation ? (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Check Your Email!
            </h3>
            <p className="text-white/80 mb-2">
              We&apos;ve sent a confirmation email to <strong>{email}</strong>
            </p>
            <p className="text-white/70 text-sm mb-4">
              Please check your inbox and click the confirmation link to
              activate your account. After confirming, you can log in to access
              your gallery.
            </p>
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-white/60 text-xs">
                💡 Tip: Don&apos;t forget to check your spam folder if you
                don&apos;t see the email within a few minutes.
              </p>
            </div>
            <p className="text-blue-300 text-sm font-medium">
              Redirecting to login in {countdown} second
              {countdown !== 1 ? "s" : ""}...
            </p>
          </div>
          {onSwitchToLogin && (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              Go to Login now →
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">{error}</p>
                  {error.toLowerCase().includes("already exists") &&
                    onSwitchToLogin && (
                      <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="mt-2 text-blue-300 hover:text-blue-200 underline text-sm cursor-pointer"
                      >
                        Click here to login →
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Username (optional)
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="Your username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>

          {onSwitchToLogin && (
            <div className="text-center text-sm text-white/60">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                Login
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
