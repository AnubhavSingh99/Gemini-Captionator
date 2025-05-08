"use client";

import { type ChangeEvent, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Image as ImageIcon, Loader2, AlertCircle, Sparkles, Wand2 } from "lucide-react";
import Navbar from "../components/ui/navbar";
import Footer from "../components/ui/footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { generateImageCaption } from "../ai/flows/generate-image-caption";
import { useToast } from "../hooks/use-toast";
import ImagePreview from "./image-preview";
import ImageHistory from "./image-history";
import { cn } from "../lib/utils";
import type { GenerateImageCaptionOutput } from "../ai/types/caption-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

// Helper function to read file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

type CaptionStyle =
  | "default"
  | "formal"
  | "humorous"
  | "poetic"
  | "cinematic"
  | "dramatic"
  | "romantic"
  | "mysterious"
  | "vibrant"
  | "minimalist"
  | "surreal"
  | "fantasy"
  | "documentary"
  | "black_and_white"
  | "retro"
  | "modern";

export default function CaptionGenerator() {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("default");
  const [context, setContext] = useState<string>("");

  useEffect(() => {
    if (!imagePreviewUrl) {
      setCaption(null);
      setError(null);
    }
  }, [imagePreviewUrl]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCaption(null);
    setError(null);
    setIsLoading(true);
    setImagePreviewUrl(null);

    if (!file.type.startsWith("image/")) {
      const errorMsg = "Invalid file type. Please upload an image (JPG, PNG, WEBP, GIF).";
      setError(errorMsg);
      setIsLoading(false);
      toast({
        title: "Upload Error",
        description: errorMsg,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      const errorMsg = "File is too large. Please upload an image smaller than 10MB.";
      setError(errorMsg);
      setIsLoading(false);
      toast({
        title: "Upload Error",
        description: errorMsg,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImagePreviewUrl(dataUrl);
      setError(null);
    } catch (err) {
      console.error("Error reading file:", err);
      const errorMsg = "Failed to read or display the selected image.";
      setError(errorMsg);
      setImagePreviewUrl(null);
      toast({
        title: "File Read Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGenerateClick = async () => {
    if (!imagePreviewUrl) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCaption(null);
    setError(null);

    try {
      const input = {
        photoDataUri: imagePreviewUrl,
        context: context || undefined,
      };

      const result: GenerateImageCaptionOutput = await generateImageCaption(input);

      if (result && result.caption) {
        setCaption(result.caption);
        setError(null);
        toast({
          title: "Caption Generated!",
          description: "Your AI-powered caption is ready.",
        });
      } else {
        throw new Error("Received an invalid response from the caption service.");
      }
    } catch (err) {
      console.error("Error during caption generation process:", err);
      let userErrorMessage = "Failed to generate caption due to an unexpected error.";
      if (err instanceof Error) {
        userErrorMessage = err.message;
      }
      setError(userErrorMessage);
      setCaption(null);
      toast({
        title: "Generation Error",
        description: userErrorMessage,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add("border-primary/50");
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove("border-primary/50");
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove("border-primary/50");

    if (isLoading) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const simulatedEvent = {
        target: { files },
      } as unknown as ChangeEvent<HTMLInputElement>;
      handleFileChange(simulatedEvent);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col md:flex-row w-full min-h-screen px-8 py-10 gap-10 bg-background">
        {/* Left column: Image upload */}
        <Card className="flex-1 max-w-full rounded-2xl border border-border/20 bg-card/70 backdrop-blur-md shadow-xl p-6 flex flex-col min-h-[80vh]">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-foreground flex items-center gap-2.5">
              <Sparkles className="h-8 w-8 text-primary" />
              Upload your image
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Click here or drag an image to upload (JPEG, JPG, PNG, WEBP)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={isLoading}
            />
            <div
              className={cn(
                "relative w-full h-full cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/40 bg-background/30 p-4 text-center transition-all duration-300 ease-in-out hover:border-primary/50 hover:bg-accent/30",
                isLoading && imagePreviewUrl && "cursor-default opacity-60",
                isLoading && !imagePreviewUrl && "cursor-wait opacity-60",
                error && !isLoading && "border-destructive/50 bg-destructive/5",
                imagePreviewUrl && !isLoading && "border-primary/20"
              )}
              onClick={!imagePreviewUrl ? handleUploadClick : undefined}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              aria-disabled={isLoading}
              role="button"
              tabIndex={imagePreviewUrl ? -1 : 0}
              onKeyDown={(e) => {
                if (!imagePreviewUrl && (e.key === "Enter" || e.key === " ")) handleUploadClick();
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-gradient-to-t from-background/5 to-transparent">
                {isLoading && !imagePreviewUrl ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg mt-1.5">Processing...</p>
                  </div>
                ) : !imagePreviewUrl ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/70">
                    <Upload className="h-12 w-12" />
                    <p className="font-medium text-lg mt-2.5">Click here or drag an image to upload</p>
                    <p className="text-sm">JPEG, JPG, PNG, WEBP</p>
                  </div>
                ) : null}
              </div>
              {imagePreviewUrl && (
                <ImagePreview imagePreviewUrl={imagePreviewUrl} isLoading={isLoading} onChangeImage={handleUploadClick} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column: Caption and controls */}
        <Card className="flex-1 max-w-full rounded-2xl border border-border/20 bg-card/70 backdrop-blur-md shadow-xl p-6 flex flex-col min-h-[80vh]">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-foreground">Your Caption:</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            <Textarea
              placeholder="Your caption will appear here..."
              value={caption || ""}
              readOnly
              className="resize-none h-56 text-lg"
            />
            <div>
              <Label htmlFor="caption-style" className="text-base font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <Wand2 className="h-5 w-5" /> Caption Style
              </Label>
              <Select value={captionStyle} onValueChange={(value) => setCaptionStyle(value as CaptionStyle)} disabled={isLoading}>
                <SelectTrigger id="caption-style" className="w-full h-12 text-base" />
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="black_and_white">Black and White</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="poetic">Poetic</SelectItem>
                  <SelectItem value="retro">Retro</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="surreal">Surreal</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="context" className="text-base font-medium text-muted-foreground mb-2">Additional prompt</Label>
              <Textarea
                id="context"
                placeholder="Add any specific instructions..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="resize-none h-16 text-base"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-8">
              {/* Placeholder toggles for Hashtags and Emojis */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="hashtags-toggle" className="cursor-pointer w-5 h-5" />
                <label htmlFor="hashtags-toggle" className="text-base font-medium text-muted-foreground cursor-pointer">Hashtags</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="emojis-toggle" className="cursor-pointer w-5 h-5" />
                <label htmlFor="emojis-toggle" className="text-base font-medium text-muted-foreground cursor-pointer">Emojis</label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateClick} disabled={isLoading || !imagePreviewUrl} className="w-full py-4 text-lg font-semibold" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Caption"
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
}
