"use client";

import Image from "next/image";
import { ModelPicker } from "@/components/app/model-picker";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CollectionRecord, GalleryImage } from "@/lib/app-types";
import { MODEL_DEFINITIONS, type SupportedModelId } from "@/lib/model-options";
import { usePendingGenerations } from "@/components/app/pending-generations-context";
import { Spinner } from "@/components/ui/spinner";
import { FolderIcon, SparklesIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

export function StudioClient(props: {
  initialCollections: CollectionRecord[];
  initialRecentImages: GalleryImage[];
}) {
  const [collections] = useState(props.initialCollections);
  const [recentImages, setRecentImages] = useState(props.initialRecentImages);
  const [generatedImage, setGeneratedImage] = useState<GalleryImage | null>(
    props.initialRecentImages[0] ?? null
  );
  const [model, setModel] = useState<SupportedModelId>("gemini-2.5-flash-image");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [collectionId, setCollectionId] = useState<string>("none");
  const { pendingGenerations, addPending, removePending, registerCompletionHandler, notifyCompletion } =
    usePendingGenerations();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    registerCompletionHandler((image) => {
      setGeneratedImage(image);
      setRecentImages((current) =>
        [image, ...current.filter((item) => item.id !== image.id)].slice(0, 6)
      );
    });
  }, [registerCompletionHandler]);

  const selectedModel = useMemo(
    () => MODEL_DEFINITIONS.find((item) => item.id === model) ?? MODEL_DEFINITIONS[0],
    [model]
  );

  function handleGenerate(message: PromptInputMessage) {
    const prompt = message.text.trim();
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }

    setError(null);

    const pendingId = crypto.randomUUID();

    addPending({ id: pendingId, prompt, modelFamily: selectedModel.family, aspectRatio });

    void (async () => {
      try {
        const response = await fetch("/api/images/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prompt,
            model,
            aspectRatio,
            collectionId: collectionId === "none" ? null : collectionId,
          }),
        });

        const payload = (await response.json()) as {
          data?: GalleryImage;
          message?: string;
        };

        if (!response.ok || !payload.data) {
          throw new Error(payload.message || "Failed to generate image.");
        }

        removePending(pendingId);
        notifyCompletion(payload.data);
      } catch (err) {
        removePending(pendingId);
        setError(err instanceof Error ? err.message : "Failed to generate image.");
      }
    })();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate with a simple endpoint</CardTitle>
            <CardDescription>
              Prompt, pick a Google image model, choose an aspect ratio, and generate
              stunning images.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <ModelPicker
                  onChange={(nextModel) => {
                    setModel(nextModel);
                    setAspectRatio(
                      MODEL_DEFINITIONS.find((item) => item.id === nextModel)
                        ?.aspectRatios[0] ?? "1:1"
                    );
                  }}
                  value={model}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aspect ratio</label>
                <PromptInputSelect
                  onValueChange={setAspectRatio}
                  value={aspectRatio}
                >
                  <PromptInputSelectTrigger className="w-full">
                    <PromptInputSelectValue placeholder="Select ratio" />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {selectedModel.aspectRatios.map((ratio) => (
                      <PromptInputSelectItem key={ratio} value={ratio}>
                        {ratio}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Collection</label>
                <PromptInputSelect
                  onValueChange={setCollectionId}
                  value={collectionId}
                >
                  <PromptInputSelectTrigger className="w-full">
                    <PromptInputSelectValue placeholder="No collection" />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    <PromptInputSelectItem value="none">
                      No collection
                    </PromptInputSelectItem>
                    {collections.map((collection) => (
                      <PromptInputSelectItem
                        key={collection.id}
                        value={collection.id}
                      >
                        {collection.name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </div>
            </div>
            <PromptInput className="space-y-3" onSubmit={handleGenerate}>
              <PromptInputBody>
                <PromptInputTextarea placeholder="Describe the image you want to generate..." />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <Badge variant="outline">
                    <SparklesIcon className="size-3.5" />
                    {selectedModel.family}
                  </Badge>
                  <Badge variant="outline">{selectedModel.provider}</Badge>
                  <Badge variant="outline">{aspectRatio}</Badge>
                  {collectionId !== "none" ? (
                    <Badge variant="outline">
                      <FolderIcon className="size-3.5" />
                      {collections.find((c) => c.id === collectionId)?.name}
                    </Badge>
                  ) : null}
                </PromptInputTools>
                <PromptInputSubmit size="sm" className="gap-1.5">
                  <SparklesIcon className="size-3.5" />
                  Generate
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
            {error ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent generations</CardTitle>
            <CardDescription>
              Your most recent images are shown here for quick access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentImages.length === 0 && pendingGenerations.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No images yet. Generate your first image above.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pendingGenerations.map((pending) => (
                  <div key={pending.id} className="overflow-hidden rounded-xl border bg-card">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <div className="flex h-full w-full animate-pulse items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Spinner className="size-6" />
                          <span className="text-xs">Generating…</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="line-clamp-2 text-sm font-medium text-muted-foreground">
                        {pending.prompt}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{pending.modelFamily}</span>
                        <span>{pending.aspectRatio}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentImages.map((image) => (
                  <a
                    className="group overflow-hidden rounded-xl border bg-card"
                    href={image.url}
                    key={image.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        alt={image.prompt}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        src={image.url}
                      />
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="line-clamp-2 text-sm font-medium">{image.prompt}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{image.model}</span>
                        <span>{image.aspectRatio}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Latest image</CardTitle>
            <CardDescription>
              The newest generated image appears here immediately after the API
              responds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedImage ? (
              <>
                <div className="overflow-hidden rounded-xl border bg-muted">
                  <img
                    alt={generatedImage.prompt}
                    className="h-auto w-full object-cover"
                    src={generatedImage.url}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-6">
                    {generatedImage.prompt}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{generatedImage.model}</Badge>
                    <Badge variant="outline">{generatedImage.aspectRatio}</Badge>
                    <Badge variant="outline">{generatedImage.provider}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <a download href={generatedImage.url}>
                        Download
                      </a>
                    </Button>
                    <Button asChild className="flex-1" size="sm" variant="outline">
                      <a href={generatedImage.url} rel="noreferrer" target="_blank">
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
                Generate an image to see it here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
