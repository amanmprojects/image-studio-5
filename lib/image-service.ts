import { generateImage } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { CollectionRecord, GalleryImage, ImageAssetRecord } from "@/lib/app-types";
import { bootstrapApp } from "@/lib/bootstrap";
import {
  collectionExistsForUser,
  createCollection,
  createImageAsset,
  getImageAssetById,
  isPostgresUniqueConstraintError,
  listCollections,
  listImageAssets,
  setImageAssetCollection,
} from "@/lib/db";
import {
  createImageModel,
  getModelDefinition,
} from "@/lib/models";
import {
  MODEL_DEFINITIONS,
  type SupportedModelId,
} from "@/lib/model-options";
import { deleteGeneratedImage, uploadGeneratedImage } from "@/lib/s3";
import "server-only";

type AspectRatio = `${number}:${number}`;

const aspectRatioSchema = z.custom<AspectRatio>((value) => {
  return typeof value === "string" && /^\d+:\d+$/.test(value);
});

export const generateImageInputSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  model: z.enum(MODEL_DEFINITIONS.map((definition) => definition.id) as [SupportedModelId, ...SupportedModelId[]]),
  aspectRatio: aspectRatioSchema,
  collectionId: z.string().trim().min(1).nullable().optional(),
});

export const createCollectionInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const moveImageToCollectionInputSchema = z.object({
  collectionId: z.string().trim().min(1).nullable(),
});

export type GalleryCollection = CollectionRecord;

export class DuplicateCollectionNameError extends Error {
  constructor() {
    super("A collection with this name already exists.");
    this.name = "DuplicateCollectionNameError";
  }
}

function extensionFromMediaType(mediaType: string) {
  switch (mediaType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

function resolveImageUrl(record: ImageAssetRecord): GalleryImage {
  return {
    ...record,
    url: `/api/images/${record.id}/content`,
  };
}

export async function generateAndStoreImage(input: {
  userId: string;
  prompt: string;
  model: SupportedModelId;
  aspectRatio: AspectRatio;
  collectionId?: string | null;
}) {
  await bootstrapApp();

  const modelDefinition = getModelDefinition(input.model);
  if (!modelDefinition) {
    throw new Error("Unsupported model selected.");
  }

  if (!(modelDefinition.aspectRatios as readonly string[]).includes(input.aspectRatio)) {
    throw new Error("Unsupported aspect ratio for the selected model.");
  }

  if (
    input.collectionId &&
    !(await collectionExistsForUser(input.collectionId, input.userId))
  ) {
    throw new Error("Collection not found.");
  }

  const result = await generateImage({
    model: createImageModel(input.model),
    prompt: input.prompt,
    aspectRatio: input.aspectRatio,
  });

  const image = result.image;
  const id = nanoid();
  const extension = extensionFromMediaType(image.mediaType);
  const createdAt = new Date().toISOString();
  const s3Key = `users/${input.userId}/${id}.${extension}`;

  await uploadGeneratedImage({
    key: s3Key,
    body: image.uint8Array,
    contentType: image.mediaType,
  });

  try {
    const record = await createImageAsset({
      id,
      userId: input.userId,
      prompt: input.prompt,
      model: input.model,
      provider: modelDefinition.provider,
      aspectRatio: input.aspectRatio,
      sourceType: "text_to_image",
      s3Key,
      mediaType: image.mediaType,
      collectionId: input.collectionId ?? null,
      createdAt,
    });

    if (!record) {
      throw new Error("Failed to persist generated image.");
    }

    return resolveImageUrl(record);
  } catch (error) {
    try {
      await deleteGeneratedImage(s3Key);
    } catch {
      // Best-effort cleanup; original error is more important.
    }
    throw error;
  }
}

export async function getUserGallery(userId: string) {
  await bootstrapApp();
  const records = await listImageAssets(userId);
  return records.map(resolveImageUrl);
}

export async function getUserCollections(userId: string) {
  await bootstrapApp();
  return await listCollections(userId);
}

export async function createUserCollection(userId: string, name: string) {
  await bootstrapApp();

  try {
    const collection = await createCollection({
      id: nanoid(),
      userId,
      name,
      createdAt: new Date().toISOString(),
    });

    if (!collection) {
      throw new Error("Failed to create collection.");
    }

    return collection;
  } catch (error) {
    if (isPostgresUniqueConstraintError(error)) {
      throw new DuplicateCollectionNameError();
    }
    throw error;
  }
}

export async function moveUserImageToCollection(input: {
  imageId: string;
  userId: string;
  collectionId: string | null;
}) {
  await bootstrapApp();

  if (
    input.collectionId &&
    !(await collectionExistsForUser(input.collectionId, input.userId))
  ) {
    throw new Error("Collection not found.");
  }

  const existingRecord = await getImageAssetById(input.imageId, input.userId);
  if (!existingRecord) {
    throw new Error("Image not found.");
  }

  const updatedRecord = await setImageAssetCollection(input);
  if (!updatedRecord) {
    throw new Error("Failed to move image.");
  }

  return resolveImageUrl(updatedRecord);
}
