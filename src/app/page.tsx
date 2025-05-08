"use client";

import React, { useState, useEffect } from "react";
import CaptionGenerator from "../components/caption-generator";
import AuthForm from "../components/ui/auth-form";
import { onUserStateChange } from "../lib/firebase-auth";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onUserStateChange((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4 md:p-12 lg:p-24 w-full">
      <div className="w-full max-w-7xl">
        {user ? <CaptionGenerator /> : <AuthForm />}
      </div>
    </main>
  );
}
