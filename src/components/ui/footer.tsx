import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white p-4 mt-8">
      <div className="max-w-7xl mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} Gemini Captionator. All rights reserved.
      </div>
    </footer>
  );
}
