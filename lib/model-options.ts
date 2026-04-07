export type SupportedModelId =
  | "gemini-2.5-flash-image"
  | "gemini-3.1-flash-image-preview"
  | "gemini-3-pro-image-preview"
  | "imagen-4.0-fast-generate-001"
  | "imagen-4.0-generate-001";

export type ModelDefinition = {
  id: SupportedModelId;
  label: string;
  provider: "google";
  family: "gemini" | "imagen";
  aspectRatios: string[];
};

export const MODEL_DEFINITIONS = [
  {
    id: "gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash Image",
    provider: "google",
    family: "gemini",
    aspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
  },
  {
    id: "gemini-3.1-flash-image-preview",
    label: "Gemini 3.1 Flash Image Preview",
    provider: "google",
    family: "gemini",
    aspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
  },
  {
    id: "gemini-3-pro-image-preview",
    label: "Gemini 3 Pro Image Preview",
    provider: "google",
    family: "gemini",
    aspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
  },
  {
    id: "imagen-4.0-fast-generate-001",
    label: "Imagen 4 Fast",
    provider: "google",
    family: "imagen",
    aspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
  },
  {
    id: "imagen-4.0-generate-001",
    label: "Imagen 4",
    provider: "google",
    family: "imagen",
    aspectRatios: ["1:1", "3:4", "4:3", "9:16", "16:9"],
  },
] as const satisfies readonly ModelDefinition[];
