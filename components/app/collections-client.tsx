"use client";

import { ImageCard } from "@/components/app/image-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CollectionRecord, GalleryImage } from "@/lib/app-types";
import { FolderPlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

export function CollectionsClient(props: {
  initialCollections: CollectionRecord[];
  initialImages: GalleryImage[];
}) {
  const [collections, setCollections] = useState(props.initialCollections);
  const [images, setImages] = useState(props.initialImages);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const grouped = useMemo(() => {
    const collectionMap = new Map(
      collections.map((collection) => [collection.id, { ...collection, images: [] as GalleryImage[] }])
    );

    const unassigned: GalleryImage[] = [];

    for (const image of images) {
      if (!image.collectionId) {
        unassigned.push(image);
        continue;
      }

      const collection = collectionMap.get(image.collectionId);
      if (collection) {
        collection.images.push(image);
      } else {
        unassigned.push(image);
      }
    }

    return {
      collections: [...collectionMap.values()],
      unassigned,
    };
  }, [collections, images]);

  async function handleCreateCollection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const payload = (await response.json()) as {
        data?: CollectionRecord;
        message?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to create collection.");
      }

      setCollections((current) => [...current, payload.data!]);
      setName("");
    } catch (collectionError) {
      setError(
        collectionError instanceof Error
          ? collectionError.message
          : "Failed to create collection."
      );
    } finally {
      setIsPending(false);
    }
  }

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>
            Create lightweight folders and keep your generated images organized.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateCollection}>
            <Input
              onChange={(event) => setName(event.target.value)}
              placeholder="New collection name"
              value={name}
            />
            <Button disabled={isPending || name.trim().length === 0} type="submit">
              <FolderPlusIcon className="size-4" />
              {isPending ? "Creating..." : "Create collection"}
            </Button>
          </form>
          {error ? (
            <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unassigned images</CardTitle>
          <CardDescription>
            Images not yet added to any collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {grouped.unassigned.length === 0 ? (
            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No unassigned images.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {grouped.unassigned.map((image) => (
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

      {grouped.collections.map((collection) => (
        <Card key={collection.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle>{collection.name}</CardTitle>
              <Badge variant="outline">{collection.images.length}</Badge>
            </div>
            <CardDescription>Images assigned to this collection.</CardDescription>
          </CardHeader>
          <CardContent>
            {collection.images.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No images in this collection yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {collection.images.map((image) => (
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
      ))}
    </div>
  );
}
