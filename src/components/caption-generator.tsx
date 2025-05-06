"use client";

import { type ChangeEvent, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Image as ImageIcon, Loader2, AlertCircle, Languages, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateImageCaption } from "@/ai/flows/generate-image-caption";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { GenerateImageCaptionInput, GenerateImageCaptionOutput } from '@/ai/types/caption-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


// Helper function to read file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

type CaptionStyle = "default" | "formal" | "humorous" | "poetic";
type CaptionLanguage = "en" | "es" | "fr" | "de"; // Example languages

export default function CaptionGenerator() {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("default");
  const [language, setLanguage] = useState<CaptionLanguage>("en");
  const [context, setContext] = useState<string>("");

  // Reset state when component mounts or when imagePreviewUrl changes externally (less likely but safe)
  useEffect(() => {
    // Reset everything if the preview URL becomes null (e.g., error occurred)
    if (!imagePreviewUrl) {
        setCaption(null);
        setError(null);
        // Don't reset isLoading here, as it's managed within handleFileChange/handleGenerateClick
    }
  }, [imagePreviewUrl]);


  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous caption/error state for the new upload attempt
    setCaption(null);
    setError(null);
    setIsLoading(true); // Indicate processing has started *for the file upload*
    setImagePreviewUrl(null); // Clear previous preview immediately

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

    try {
      // Show preview quickly
      const dataUrl = await readFileAsDataURL(file);
      setImagePreviewUrl(dataUrl); // Show preview
      setError(null); // Clear upload errors on successful preview
    } catch (err) {
        console.error("Error reading file:", err);
        const errorMsg = "Failed to read or display the selected image.";
        setError(errorMsg);
        setImagePreviewUrl(null); // Ensure preview is cleared on read error
         toast({
            title: "File Read Error",
            description: errorMsg,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false); // Stop loading indicator after file processing
         // Reset file input value AFTER processing, allowing re-upload of the same file
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

      setIsLoading(true); // Start loading for caption generation
      setCaption(null); // Clear previous caption
      setError(null); // Clear previous error

      try {
          // Prepare input for AI
          const input: GenerateImageCaptionInput = {
              photoDataUri: imagePreviewUrl,
              style: captionStyle,
              language: language,
              context: context || undefined, // Send context only if provided
          };

          // Call AI caption generation - this is the async server action
          const result: GenerateImageCaptionOutput = await generateImageCaption(input);

          if (result && result.caption) {
            setCaption(result.caption);
            setError(null); // Clear previous errors on success
             toast({
                title: "Caption Generated!",
                description: "Your AI-powered caption is ready.",
            });
          } else {
             // This case might occur if the flow resolves but returns an unexpected structure
             throw new Error("Received an invalid response from the caption service.");
          }
      } catch (err) {
          console.error("Error during caption generation process:", err); // Log the actual error object to console

          // Extract a user-friendly error message from the caught error.
          let userErrorMessage = "Failed to generate caption due to an unexpected error.";
           if (err instanceof Error) {
                // Use the message directly from the error thrown by the server flow
                userErrorMessage = err.message;
           }

          setError(userErrorMessage);
          setCaption(null); // Ensure caption is cleared on error

          toast({
            title: "Generation Error",
            description: userErrorMessage,
            variant: "destructive",
            duration: 9000, // Give more time to read potentially longer error messages
          });
      } finally {
          setIsLoading(false); // Ensure loading indicator stops
      }
  }

  const handleUploadClick = () => {
    // Clear previous error/caption when initiating a new upload via click
    if (!isLoading) {
        fileInputRef.current?.click();
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-primary/50');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-primary/50');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-primary/50');

    if (isLoading) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        const simulatedEvent = {
            target: { files }
        } as unknown as ChangeEvent<HTMLInputElement>;
        handleFileChange(simulatedEvent);
    }
  };


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl rounded-2xl border border-border/20 bg-card/70 backdrop-blur-md">
      <CardHeader className="border-b border-border/20 p-5">
        <CardTitle className="flex items-center gap-2.5 text-xl font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Image Captioner
        </CardTitle>
         <CardDescription className="text-sm text-muted-foreground pt-1">
          Upload an image and let AI craft the perfect caption for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 md:p-6 space-y-6">
        {/* File Input (Hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={isLoading} // Disable during any loading state
        />

        {/* Upload Area / Image Preview */}
         <div
          className={cn(
            "relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-background/30 p-4 text-center transition-all duration-300 ease-in-out hover:border-primary/50 hover:bg-accent/30",
            "overflow-hidden",
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
          onKeyDown={(e) => { if (!imagePreviewUrl && (e.key === 'Enter' || e.key === ' ')) handleUploadClick(); }}
        >
          {/* Overlay for Loading/Upload Prompt */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 bg-gradient-to-t from-background/5 to-transparent">
            {isLoading && !imagePreviewUrl ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm mt-1.5">Processing...</p>
              </div>
            ) : !imagePreviewUrl ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/70">
                <Upload className="h-10 w-10" />
                <p className="font-medium text-base mt-2.5">Drag & drop or click to upload</p>
                <p className="text-xs">Max 10MB (JPG, PNG, WEBP, GIF)</p>
              </div>
            ) : null }
          </div>

          {/* Image Preview Layer */}
          {imagePreviewUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={imagePreviewUrl}
                alt="Image preview"
                fill={true}
                style={{ objectFit: 'contain' }}
                className={cn(
                    "rounded-lg transition-opacity duration-300",
                    isLoading ? "opacity-40" : "opacity-100"
                 )}
                data-ai-hint="uploaded image preview"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Provide sizes for responsive images
              />
              {!isLoading && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                  className="absolute bottom-3.5 right-3.5 z-20 bg-background/70 backdrop-blur-sm text-xs px-3 py-1.5 h-auto border-border/60 shadow-md hover:bg-background/90"
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Change Image
                </Button>
              )}
            </div>
          )}
        </div>


         {/* Configuration Options - Only show if an image is uploaded */}
        {imagePreviewUrl && !isLoading && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/20 mt-2">
                <div className="space-y-1.5">
                    <Label htmlFor="caption-style" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                         <Wand2 className="h-4 w-4" /> Caption Style
                    </Label>
                    <Select value={captionStyle} onValueChange={(value) => setCaptionStyle(value as CaptionStyle)} disabled={isLoading}>
                        <SelectTrigger id="caption-style" className="w-full h-10 text-sm">
                            <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="humorous">Humorous</SelectItem>
                            <SelectItem value="poetic">Poetic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="language" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Languages className="h-4 w-4" /> Language
                    </Label>
                    <Select value={language} onValueChange={(value) => setLanguage(value as CaptionLanguage)} disabled={isLoading}>
                        <SelectTrigger id="language" className="w-full h-10 text-sm">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                 <div className="md:col-span-2 space-y-1.5">
                     <Label htmlFor="context" className="text-xs font-medium text-muted-foreground">Optional Context (keywords, event, mood etc.)</Label>
                    <Textarea
                        id="context"
                        placeholder="e.g., birthday party, serene beach, product details..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="text-sm min-h-[65px] resize-none"
                        disabled={isLoading}
                    />
                 </div>
            </div>
        )}

        {/* Generate Button - Only show and enable if image is loaded and not loading */}
        {imagePreviewUrl && (
            <Button
                onClick={handleGenerateClick}
                disabled={isLoading || !imagePreviewUrl}
                className="w-full mt-4 py-3 text-base font-medium"
                size="lg"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-5 w-5" /> Generate Caption
                    </>
                )}
            </Button>
        )}


        {/* Error Display */}
        {error && !isLoading && (
          <Alert variant="destructive" className="rounded-xl border-destructive/40 bg-destructive/5 p-3.5 text-sm mt-5">
            <AlertCircle className="h-4.5 w-4.5 text-destructive" />
            <AlertTitle className="font-semibold text-sm mb-1">Error Generating Caption</AlertTitle>
            <AlertDescription className="text-destructive/90 break-words text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Caption Display */}
        {caption && !isLoading && (
          <div className="rounded-xl border border-border/30 bg-gradient-to-tr from-background/20 to-accent/10 p-4 md:p-5 space-y-2.5 mt-5 animate-in fade-in duration-700 shadow-inner">
             <h3 className="text-sm font-semibold tracking-wide text-primary flex items-center gap-2">
                 <ImageIcon className="h-4.5 w-4.5" /> AI Generated Caption
             </h3>
             <p className="text-base text-foreground/95 leading-relaxed">{caption}</p>
          </div>
        )}

         {/* Initial state prompt (only if nothing else is happening) */}
        {!imagePreviewUrl && !caption && !error && !isLoading && (
           <CardFooter className="text-center text-sm text-muted-foreground/60 py-5 border-t border-border/10 mt-5 justify-center">
              <p>Upload an image to let the AI work its magic!</p>
            </CardFooter>
        )}

         {/* Loading state for caption generation */}
         {isLoading && imagePreviewUrl && (
              <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground py-8 border-t border-border/10 mt-5">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <p className="text-sm mt-1.5">Crafting your caption...</p>
              </div>
         )}
      </CardContent>
    </Card>
  );
}