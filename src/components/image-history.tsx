"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ImageHistoryItem {
  id: string;
  imageData: string;
  caption: string | null;
  style: string;
  context: string | null;
  createdAt: string;
}

const hardcodedHashtags = ["#AI", "#GeminiCaptionator", "#ImageCaption", "#NextJS"];
const hardcodedEmojis = ["✨", "📸", "🤖", "🎉"];

export default function ImageHistory() {
  const [images, setImages] = useState<ImageHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/images");
        if (!res.ok) {
          throw new Error("Failed to fetch image history");
        }
        const data = await res.json();
        console.log("Fetched images:", data);
        setImages(data);
      } catch (err) {
        console.error("Error fetching images:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  if (loading) {
    return <p className="text-center text-sm text-muted-foreground">Loading image history...</p>;
  }

  if (error) {
    return <p className="text-center text-sm text-destructive">Error: {error}</p>;
  }

  if (images.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">No image history available.</p>;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Previous Images & Captions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative w-full h-32 rounded-lg overflow-hidden border border-border/30">
              {img.imageData ? (
                <Image
                  src={img.imageData}
                  alt={img.caption || "Uploaded image"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 text-xs">
                  No image data
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {img.caption || "No caption"} ({img.style || "default"})
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Popular Hashtags: {hardcodedHashtags.join(" ")}</p>
          <p>Emojis: {hardcodedEmojis.join(" ")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
