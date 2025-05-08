import CaptionGenerator from "../components/caption-generator";
import { Toaster } from "../components/ui/toaster";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4 md:p-12 lg:p-24">
      <div className="w-full">
        <CaptionGenerator />
      </div>
      <Toaster />
    </main>
  );
}
