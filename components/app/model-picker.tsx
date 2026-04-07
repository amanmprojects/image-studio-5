"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
import { MODEL_DEFINITIONS, type SupportedModelId } from "@/lib/model-options";
import { CheckIcon, SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";

export function ModelPicker(props: {
  value: SupportedModelId;
  onChange: (value: SupportedModelId) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedModel = useMemo(
    () => MODEL_DEFINITIONS.find((model) => model.id === props.value) ?? MODEL_DEFINITIONS[0],
    [props.value]
  );

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <ModelSelectorTrigger asChild>
        <Button className="w-full justify-between" type="button" variant="outline">
          <span className="flex items-center gap-2 truncate">
            <SparklesIcon className="size-4" />
            <span className="truncate">{selectedModel.label}</span>
          </span>
          <span className="text-xs text-muted-foreground">Choose model</span>
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent className="sm:max-w-xl" title="Select image model">
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Google image models">
            {MODEL_DEFINITIONS.map((model) => (
              <ModelSelectorItem
                key={model.id}
                onSelect={() => {
                  props.onChange(model.id);
                  setOpen(false);
                }}
                value={`${model.label} ${model.id} ${model.family}`}
              >
                <ModelSelectorLogo provider="google" />
                <ModelSelectorName>{model.label}</ModelSelectorName>
                <span className="text-xs text-muted-foreground uppercase">
                  {model.family}
                </span>
                {props.value === model.id ? <CheckIcon className="ml-2 size-4" /> : null}
              </ModelSelectorItem>
            ))}
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
