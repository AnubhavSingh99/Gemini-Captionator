import CaptionGenerator from "@/components/caption-generator";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold md:text-4xl">
          Gemini Captionator
        </h1>
        <CaptionGenerator />
      </div>
      <Toaster />
    </main>
  );
}
