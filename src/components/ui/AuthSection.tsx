"use client";

import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { useAuth } from "@/lib/contexts";

export const AuthSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const { isAuthenticated } = useAuth();

  // Don't show auth section if user is already logged in
  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "login"
                  ? "text-white bg-white/10 border-b-2 border-blue-500"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "signup"
                  ? "text-white bg-white/10 border-b-2 border-blue-500"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {activeTab === "login" ? (
              <LoginForm
                onSuccess={() => {
                  // User will be redirected or page will update automatically
                }}
                onSwitchToSignup={() => setActiveTab("signup")}
              />
            ) : (
              <SignupForm
                onSuccess={() => {
                  // User will be redirected or page will update automatically
                }}
                onSwitchToLogin={() => setActiveTab("login")}
              />
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-white/50 text-sm">
          <p>
            By signing up, you agree to our{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
