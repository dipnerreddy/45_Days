// src/app/page.tsx

"use client"; // <-- This is CRUCIAL for using hooks

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <-- Next.js router
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const LandingPage = () => {
  const router = useRouter(); // <-- Use the Next.js router hook
  const { user, loading } = useAuth();

  // This logic is good! It redirects logged-in users.
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard'); // <-- Use router.push()
    }
  }, [user, loading, router]);

  // The loading spinner is a great UX touch.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, and not loading, show the page
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-4 py-6">
        <div className="mx-auto max-w-md">
          <h1 className="text-center text-2xl font-bold">45-Day Challenge</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Transform Yourself in
              <span className="text-primary"> 45 Days</span>
            </h2>
            <p className="leading-relaxed text-gray-600">
              Join our strict fitness challenge. Miss a single day, and you start over.
              Are you ready for the commitment?
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">What You Get:</h3>
            <ul className="space-y-2 text-left text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Daily workout routines (Home or Gym)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Progress tracking & streak counter
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Motivational quotes & tips
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Completion certificate
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            {/* BEST PRACTICE: Wrap the Button in a Link component */}
            <Link href="/signup" passHref>
              <Button
                size="lg" // Use size prop for consistency
                className="w-full text-lg" // No need for manual padding/font-size
              >
                Start Your Challenge
              </Button>
            </Link>

            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6 text-center text-sm text-gray-500">
        <p>© 2024 45-Day Challenge. Transform yourself, one day at a time.</p>
      </footer>
    </div>
  );
};

export default LandingPage;