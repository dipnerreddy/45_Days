"use client";

import { useState, useEffect } from "react";

// This is a FAKE auth hook for now.
// Later, we will replace this with real Supabase logic.
export const useAuth = () => {
  const [user, setUser] = useState(null); // Initially, no user is logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a user session
    const timer = setTimeout(() => {
      // To test the redirect, you could temporarily set a fake user:
      // setUser({ email: 'test@example.com' }); 
      setLoading(false);
    }, 1000); // Simulate a 1-second loading time

    return () => clearTimeout(timer);
  }, []);

  return { user, loading };
};