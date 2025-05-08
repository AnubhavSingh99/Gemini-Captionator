"use client";

import React, { useEffect, useState } from "react";
import { auth, logoutUser, onUserStateChange } from "../../lib/firebase-auth";

export default function Navbar() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onUserStateChange((user) => {
      if (user) {
        setUser(user.email);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-lg font-bold">Gemini Captionator</h1>
        <div>
          {user ? (
            <>
              <span className="mr-4">Signed in as {user}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
      </div>
    </nav>
  );
}
