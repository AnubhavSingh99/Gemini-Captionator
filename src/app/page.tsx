import CaptionGenerator from "@/components/caption-generator";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    // Use flexbox to center the content vertically and horizontally
    // Add more padding for better spacing on larger screens
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4 md:p-12 lg:p-24">
      {/* The w-full ensures it takes available width, max-w controls the maximum size */}
      <div className="w-full max-w-md"> {/* Adjusted max-width if needed */}
        {/* Removed the h1 title from here, letting the Card handle its title */}
        <CaptionGenerator />
      </div>
      <Toaster />
    </main>
  );
}
