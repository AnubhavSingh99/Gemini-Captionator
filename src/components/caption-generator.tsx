"use client";

import { type ChangeEvent, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateImageCaption, GenerateImageCaptionInput, GenerateImageCaptionOutput } from "@/ai/flows/generate-image-caption";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Helper function to read file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function CaptionGenerator() {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset state when component mounts to avoid issues with browser back/forward cache
  useEffect(() => {
    setImagePreviewUrl(null);
    setCaption(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setImagePreviewUrl(null);
    setCaption(null);
    setError(null);
    setIsLoading(true); // Start loading immediately

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Invalid file type. Please upload an image.");
      setIsLoading(false);
      toast({
        title: "Upload Error",
        description: "Invalid file type. Please upload an image.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImagePreviewUrl(dataUrl);

      // Prepare input for AI
      const input: GenerateImageCaptionInput = { photoDataUri: dataUrl };

      // Call AI caption generation
      const result: GenerateImageCaptionOutput = await generateImageCaption(input);
      if (result.caption) {
        setCaption(result.caption);
        setError(null); // Clear previous errors
      } else {
        throw new Error("Failed to generate caption.");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to process image or generate caption: ${errorMessage}`);
      setCaption(null); // Ensure caption is cleared on error
      setImagePreviewUrl(null); // Clear preview on error
      toast({
        title: "Generation Error",
        description: `Failed to generate caption: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset file input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full shadow-md border border-border/80 rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ImageIcon className="h-5 w-5 text-primary" />
          Image Captionator
        </CardTitle>
        <CardDescription className="text-sm">
          Upload an image to generate an AI-powered caption.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input (Hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isLoading}
        />

        {/* Upload Area / Image Preview */}
        <div
          className={cn(
            "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-md border border-border bg-secondary/30 p-4 text-center transition-colors hover:border-primary/50", // Solid border, lighter bg
            isLoading && "cursor-wait opacity-70"
          )}
          onClick={!isLoading ? handleUploadClick : undefined} // Only allow click if not loading
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p>Generating caption...</p>
               {/* Smaller skeleton for image preview */}
              <Skeleton className="mt-3 h-[150px] w-[250px] rounded-sm" />
            </div>
          ) : imagePreviewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <Image
                src={imagePreviewUrl}
                alt="Uploaded preview"
                width={350} // Slightly smaller preview
                height={250}
                className="max-h-[250px] w-auto rounded-sm object-contain shadow-sm" // Reduced shadow
                data-ai-hint="uploaded image"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                className="mt-2" // Add margin top
              >
                <Upload className="mr-1.5 h-4 w-4" /> Change
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <Upload className="h-10 w-10" />
              <p className="font-medium">Click or drag to upload image</p>
              <p className="text-xs">JPG, PNG, WEBP, GIF supported</p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && !isLoading && (
          <Alert variant="destructive" className="rounded-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Caption Display - Simplified */}
        {caption && !isLoading && (
          <div className="rounded-md border border-border bg-card p-4 shadow-sm">
             <h3 className="mb-2 text-md font-semibold text-foreground">Generated Caption</h3>
             <p className="text-sm text-foreground/90">{caption}</p>
          </div>
        )}

         {/* Initial state prompt */}
        {!caption && !error && !isLoading && !imagePreviewUrl && (
           <div className="text-center text-sm text-muted-foreground py-4">
              Upload an image to view the generated caption.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
