"use client";

import { ImageCard } from "@/components/app/image-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CollectionRecord, GalleryImage } from "@/lib/app-types";
import { useState } from "react";

export function GalleryClient(props: {
  initialCollections: CollectionRecord[];
  initialImages: GalleryImage[];
}) {
  const [collections] = useState(props.initialCollections);
  const [images, setImages] = useState(props.initialImages);

  async function handleMove(imageId: string, collectionId: string | null) {
    const response = await fetch("/api/images/move", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ imageId, collectionId }),
    });

    const payload = (await response.json()) as {
      data?: GalleryImage;
      message?: string;
    };

    if (!response.ok || !payload.data) {
      throw new Error(payload.message || "Failed to move image.");
    }

    setImages((current) =>
      current.map((image) => (image.id === payload.data!.id ? payload.data! : image))
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
        <CardDescription>
          Browse every generated image and move it between collections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
            No generated images yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <ImageCard
                collections={collections}
                image={image}
                key={image.id}
                onMove={handleMove}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
