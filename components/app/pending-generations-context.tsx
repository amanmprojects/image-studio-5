"use client";

import type { GalleryImage } from "@/lib/app-types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

export type PendingGeneration = {
  id: string;
  prompt: string;
  modelFamily: string;
  aspectRatio: string;
};

type CompletionHandler = (image: GalleryImage) => void;

type PendingGenerationsContextValue = {
  pendingGenerations: PendingGeneration[];
  addPending: (item: PendingGeneration) => void;
  removePending: (id: string) => void;
  registerCompletionHandler: (handler: CompletionHandler) => void;
  notifyCompletion: (image: GalleryImage) => void;
};

const PendingGenerationsContext =
  createContext<PendingGenerationsContextValue | null>(null);

export function PendingGenerationsProvider({ children }: PropsWithChildren) {
  const [pendingGenerations, setPendingGenerations] = useState<
    PendingGeneration[]
  >([]);
  const completionHandlerRef = useRef<CompletionHandler | null>(null);

  const addPending = useCallback((item: PendingGeneration) => {
    setPendingGenerations((prev) => [item, ...prev]);
  }, []);

  const removePending = useCallback((id: string) => {
    setPendingGenerations((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const registerCompletionHandler = useCallback(
    (handler: CompletionHandler) => {
      completionHandlerRef.current = handler;
    },
    []
  );

  const notifyCompletion = useCallback((image: GalleryImage) => {
    completionHandlerRef.current?.(image);
  }, []);

  const value = useMemo(
    () => ({
      pendingGenerations,
      addPending,
      removePending,
      registerCompletionHandler,
      notifyCompletion,
    }),
    [
      pendingGenerations,
      addPending,
      removePending,
      registerCompletionHandler,
      notifyCompletion,
    ]
  );

  return (
    <PendingGenerationsContext.Provider value={value}>
      {children}
    </PendingGenerationsContext.Provider>
  );
}

export function usePendingGenerations() {
  const ctx = useContext(PendingGenerationsContext);
  if (!ctx) {
    throw new Error(
      "usePendingGenerations must be used within PendingGenerationsProvider"
    );
  }
  return ctx;
}
