"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ImageHistoryItem {
  _id: string;
  imageData: string;
  caption: string | null;
  style: string;
  context: string | null;
  createdAt: string;
}

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
        setImages(data);
      } catch (err) {
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {images.map((img) => (
        <div key={img._id} className="relative w-full h-32 rounded-lg overflow-hidden border border-border/30">
          <Image
            src={img.imageData}
            alt={img.caption || "Uploaded image"}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </div>
      ))}
    </div>
  );
}
