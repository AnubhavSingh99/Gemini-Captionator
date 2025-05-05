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
import type { GenerateImageCaptionInput, GenerateImageCaptionOutput } from '@/ai/types/caption-types';

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

  // Reset state when component mounts or when imagePreviewUrl changes externally (less likely but safe)
  useEffect(() => {
    // Reset everything if the preview URL becomes null (e.g., error occurred)
    if (!imagePreviewUrl) {
        setCaption(null);
        setError(null);
        // Don't reset isLoading here, as it's managed within handleFileChange
    }
  }, [imagePreviewUrl]);


  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous state for the new upload attempt
    setImagePreviewUrl(null); // Clear previous preview immediately
    setCaption(null);
    setError(null);
    setIsLoading(true); // Indicate processing has started

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Invalid file type. Please upload an image (JPG, PNG, WEBP, GIF).";
      setError(errorMsg);
      setIsLoading(false);
      toast({
        title: "Upload Error",
        description: errorMsg,
        variant: "destructive",
      });
      // Clear the file input so the user can select the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

     // Validate file size (e.g., limit to 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
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


    let dataUrl = '';
    try {
      // Show preview quickly
      dataUrl = await readFileAsDataURL(file);
      setImagePreviewUrl(dataUrl); // Show preview before calling AI

      // Prepare input for AI
      const input: GenerateImageCaptionInput = { photoDataUri: dataUrl };

      // Call AI caption generation - this is the async server action
      const result: GenerateImageCaptionOutput = await generateImageCaption(input);

      if (result && result.caption) {
        setCaption(result.caption);
        setError(null); // Clear previous errors on success
      } else {
         // This case might occur if the flow resolves but returns an unexpected structure
         throw new Error("Received an invalid response from the caption service.");
      }
    } catch (err) {
      console.error("Error during caption generation process:", err); // Log the actual error object to console

      // Extract a user-friendly error message from the caught error.
      // The server flow now includes a digest in the error message for production debugging.
      let userErrorMessage = "Failed to generate caption due to an unexpected error.";
       if (err instanceof Error) {
            // Use the message directly from the error thrown by the server flow
            // This message might include the digest in production.
            userErrorMessage = err.message;
       }

      setError(userErrorMessage);
      setCaption(null); // Ensure caption is cleared on error
      // Consider keeping the image preview even if captioning fails
      // setImagePreviewUrl(null); // Optionally clear preview on error

      toast({
        title: "Generation Error",
        // Display the potentially detailed error message (including digest) in the toast as well
        description: userErrorMessage,
        variant: "destructive",
        duration: 9000, // Give more time to read potentially longer error messages
      });
    } finally {
      setIsLoading(false); // Ensure loading indicator stops
      // Reset file input value to allow re-uploading the same file if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    // Clear previous error/caption when initiating a new upload via click
    if (!isLoading) {
        setError(null);
        setCaption(null);
        // Keep the preview if it exists, it will be replaced on file selection
        // setImagePreviewUrl(null);
        fileInputRef.current?.click();
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
    event.stopPropagation();
     // Optionally add visual feedback
      event.currentTarget.classList.add('border-primary/50'); // Add subtle border highlight
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
     // Optionally remove visual feedback
      event.currentTarget.classList.remove('border-primary/50'); // Remove highlight
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Optionally remove visual feedback
    event.currentTarget.classList.remove('border-primary/50'); // Remove highlight

    if (isLoading) return; // Don't allow drop while loading

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        // Simulate file input change event
        const simulatedEvent = {
            target: { files }
        } as unknown as ChangeEvent<HTMLInputElement>; // Type assertion
        handleFileChange(simulatedEvent);
    }
  };


  return (
     // Use a simpler, cleaner card styling
    <Card className="w-full max-w-lg mx-auto shadow-md rounded-lg border border-border/50 bg-card">
      <CardHeader className="border-b border-border/50 p-4">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
          <ImageIcon className="h-4 w-4 text-primary" />
          AI Image Caption Generator
        </CardTitle>
         {/* Removed description for minimalism */}
         {/* <CardDescription className="text-xs text-muted-foreground mt-1">
          Upload an image and let AI generate a caption for you.
        </CardDescription> */}
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* File Input (Hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif" // Be more specific
          className="hidden"
          disabled={isLoading}
        />

        {/* Upload Area / Image Preview - Minimal Styling */}
        <div
          className={cn(
            "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border/60 bg-background/30 p-4 text-center transition-colors hover:border-primary/40 hover:bg-accent/30", // Lighter dashed border, minimal background
            isLoading && "cursor-wait opacity-70",
            error && "border-destructive/50 bg-destructive/5" // Minimal error indication
          )}
          onClick={handleUploadClick} // Allow click to upload
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-disabled={isLoading}
          role="button"
          tabIndex={0} // Make it focusable
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUploadClick(); }} // Keyboard accessibility
        >
           {/* Absolute positioning for overlay elements */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
             {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs mt-1">
                        {imagePreviewUrl ? 'Generating caption...' : 'Processing image...'}
                    </p>
                </div>
             ) : imagePreviewUrl ? null : ( // Only show upload prompt if not loading and no image
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-7 w-7" />
                  <p className="font-medium text-sm mt-1">Drag & drop or click here</p>
                  <p className="text-xs">Max 10MB (JPG, PNG, WEBP, GIF)</p>
                </div>
             )}
          </div>

           {/* Image Preview Layer (Below Overlay) */}
          {imagePreviewUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={imagePreviewUrl}
                alt="Image preview"
                 // Use layout="fill" and objectFit="contain" for better responsiveness within the container
                layout="fill"
                objectFit="contain"
                className="rounded-md opacity-90" // Slightly transparent
                data-ai-hint="uploaded image preview"
              />
               {/* Change Button Overlay (only when not loading) */}
               {!isLoading && (
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={(e) => { e.stopPropagation(); handleUploadClick(); }} // Prevent triggering div click
                   className="absolute bottom-2 right-2 z-20 bg-background/70 backdrop-blur-sm text-xs px-2 py-1 h-auto border-border/70 hover:bg-background/90" // Positioned button
                 >
                   <Upload className="mr-1 h-3 w-3" /> Change
                 </Button>
               )}
            </div>
          )}
        </div>

        {/* Error Display - Minimal */}
        {error && !isLoading && ( // Show error only when not loading
          <Alert variant="destructive" className="rounded-md border-destructive/40 bg-destructive/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-medium text-xs mb-0.5">Error</AlertTitle>
            {/* Ensure long error messages wrap */}
             <AlertDescription className="text-destructive/90 break-words">{error}</AlertDescription>
          </Alert>
        )}

        {/* Caption Display - Minimal */}
        {caption && !isLoading && ( // Show caption only when not loading and caption exists
          <div className="rounded-md border border-border/40 bg-background/40 p-3 space-y-1 animate-in fade-in duration-300">
             {/* Removed explicit title for minimalism */}
             {/* <h3 className="text-xs font-semibold uppercase tracking-wider text-primary/80">Generated Caption</h3> */}
             <p className="text-sm text-foreground leading-snug">{caption}</p>
          </div>
        )}

         {/* Initial state prompt (only show if nothing else is displayed) - More subtle */}
        {!imagePreviewUrl && !caption && !error && !isLoading && (
           <div className="text-center text-xs text-muted-foreground py-2">
              Upload an image to generate a caption.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
