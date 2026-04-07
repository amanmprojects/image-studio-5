"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CollectionRecord, GalleryImage } from "@/lib/app-types";
import { DownloadIcon, ExternalLinkIcon, FolderIcon } from "lucide-react";
import { useEffect, useState } from "react";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ImageCard(props: {
  image: GalleryImage;
  collections: CollectionRecord[];
  onMove?: (imageId: string, collectionId: string | null) => Promise<void>;
}) {
  const [value, setValue] = useState(props.image.collectionId ?? "none");
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    setValue(props.image.collectionId ?? "none");
  }, [props.image.collectionId]);

  async function handleMove(nextValue: string) {
    const previousValue = value;
    setValue(nextValue);

    if (!props.onMove) {
      return;
    }

    try {
      setIsMoving(true);
      await props.onMove(props.image.id, nextValue === "none" ? null : nextValue);
    } catch {
      setValue(previousValue);
    } finally {
      setIsMoving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          alt={props.image.prompt}
          className="h-full w-full object-cover"
          src={props.image.url}
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{props.image.prompt}</CardTitle>
        <CardDescription>{formatDate(props.image.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{props.image.model}</Badge>
          <Badge variant="outline">{props.image.aspectRatio}</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FolderIcon className="size-3.5" />
            Collection
          </div>
          <Select disabled={isMoving} onValueChange={handleMove} value={value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No collection</SelectItem>
              {props.collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button asChild size="sm" variant="outline">
          <a href={props.image.url} rel="noreferrer" target="_blank">
            <ExternalLinkIcon className="size-4" />
            Open
          </a>
        </Button>
        <Button asChild size="sm">
          <a download href={props.image.url}>
            <DownloadIcon className="size-4" />
            Download
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
