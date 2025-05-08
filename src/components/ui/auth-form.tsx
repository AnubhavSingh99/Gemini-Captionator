"use client";

import React, { useState } from "react";
import { loginUser, registerUser, loginWithGoogle } from "../../lib/firebase-auth";
import { useToast } from "../../hooks/use-toast";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email, password);
        toast({ title: "Registration successful", description: "You can now log in." });
        setIsRegister(false);
      } else {
        await loginUser(email, password);
        toast({ title: "Login successful" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Authentication failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Google login successful" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Google login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>
      </form>
      <button
        onClick={handleGoogleLogin}
        className="w-full mt-4 bg-red-600 text-white py-3 rounded hover:bg-red-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Processing..." : "Continue with Google"}
      </button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          className="text-primary underline"
          onClick={() => setIsRegister(!isRegister)}
          disabled={loading}
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
}
