import CaptionGenerator from "@/components/caption-generator";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8"> {/* Adjusted padding */}
      <div className="w-full max-w-lg"> {/* Slightly reduced max-width */}
        <h1 className="mb-4 text-center text-2xl font-semibold md:text-3xl text-foreground"> {/* Reduced margin-bottom and font size */}
          Gemini Captionator
        </h1>
        <CaptionGenerator />
      </div>
      <Toaster />
    </main>
  );
}
