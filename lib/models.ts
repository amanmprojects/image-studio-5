import { google } from "@ai-sdk/google";
import type { ImageModel } from "ai";
import {
  MODEL_DEFINITIONS,
  type SupportedModelId,
} from "@/lib/model-options";

const modelDefinitionMap = new Map(
  MODEL_DEFINITIONS.map((definition) => [definition.id, definition])
);

export function getModelDefinition(modelId: string) {
  return modelDefinitionMap.get(modelId as SupportedModelId) || null;
}

export function createImageModel(modelId: SupportedModelId): ImageModel {
  return google.image(modelId);
}
