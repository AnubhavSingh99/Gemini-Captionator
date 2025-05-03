"use client";

import { type ChangeEvent, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateImageCaption } from "@/ai/flows/generate-image-caption";
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

      // Call AI caption generation
      const result = await generateImageCaption({ photoDataUri: dataUrl });
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
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-accent-foreground" />
          Image Captioning
        </CardTitle>
        <CardDescription>
          Upload an image and let AI generate a caption for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            "flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-accent-foreground/50",
            isLoading && "cursor-wait opacity-70"
          )}
          onClick={!isLoading ? handleUploadClick : undefined} // Only allow click if not loading
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-accent-foreground" />
              <p>Generating caption...</p>
              <Skeleton className="mt-4 h-[200px] w-[300px] rounded-md" /> {/* Skeleton for image */}
            </div>
          ) : imagePreviewUrl ? (
            <div className="flex flex-col items-center gap-4">
              <Image
                src={imagePreviewUrl}
                alt="Uploaded preview"
                width={400}
                height={300}
                className="max-h-[300px] w-auto rounded-md object-contain shadow-md"
                data-ai-hint="uploaded image" // Placeholder hint
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
              >
                <Upload className="mr-2" /> Change Image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-12 w-12" />
              <p>Click or drag image to upload</p>
              <p className="text-xs">Supports JPG, PNG, WEBP, GIF</p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && !isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Caption Display */}
        {caption && !isLoading && (
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Generated Caption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{caption}</p>
            </CardContent>
          </Card>
        )}

         {/* Initial state prompt or loading state for caption */}
        {!caption && !error && !isLoading && !imagePreviewUrl && (
           <div className="text-center text-muted-foreground">
              Upload an image to see the generated caption here.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
