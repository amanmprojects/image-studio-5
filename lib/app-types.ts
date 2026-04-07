export type CollectionRecord = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
};

export type ImageAssetRecord = {
  id: string;
  userId: string;
  prompt: string;
  model: string;
  provider: string;
  aspectRatio: string;
  sourceType: "text_to_image" | "edit";
  s3Key: string;
  mediaType: string;
  collectionId: string | null;
  createdAt: string;
};

export type GalleryImage = ImageAssetRecord & {
  url: string;
};
