"use client"

import { Button } from "@/components/ui/button"

interface ImagePreviewProps {
  imagePreviewUrl: string
  isLoading: boolean
  onChangeImage: () => void
}

export default function ImagePreview({ imagePreviewUrl, isLoading, onChangeImage }: ImagePreviewProps) {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      <img src={imagePreviewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
      {!isLoading && (
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" size="sm" onClick={onChangeImage}>
            Change image
          </Button>
        </div>
      )}
    </div>
  )
}
