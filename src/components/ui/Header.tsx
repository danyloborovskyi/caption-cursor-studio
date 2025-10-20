"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/lib/contexts";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLoginClick = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className={`w-full ${className}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo and Title Section */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                {/* Logo/Icon */}
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-tight">
                    Visual Caption & Tag Studio
                  </h1>
                  <p className="text-sm text-white/70 font-light">
                    AI-powered image analysis
                  </p>
                </div>
              </button>

              {/* Navigation Links (show when authenticated) */}
              {isAuthenticated && (
                <nav className="hidden md:flex items-center gap-1">
                  <button
                    onClick={() => router.push("/upload")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/upload"
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => router.push("/gallery")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/gallery"
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Gallery
                  </button>
                </nav>
              )}
            </div>

            {/* Right Side: Auth Buttons or User Menu */}
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Button
                    onClick={handleLoginClick}
                    variant="secondary"
                    size="sm"
                    className="px-5"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={handleSignupClick}
                    variant="primary"
                    size="sm"
                    className="px-5"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {user?.username || user?.email || "User"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-white transition-transform ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">
                          {user?.username || "User"}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};
