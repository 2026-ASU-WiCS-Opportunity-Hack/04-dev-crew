"use client";

import { createContext, useContext } from "react";

type ChapterDashboardContextValue = {
  chapterId: string | null;
  chapterSlug: string | null;
  chapterName: string | null;
  isSuperAdmin: boolean;
  orgRole: string | null;
};

const ChapterDashboardContext =
  createContext<ChapterDashboardContextValue | null>(null);

export function ChapterDashboardProvider({
  value,
  children,
}: {
  value: ChapterDashboardContextValue;
  children: React.ReactNode;
}) {
  return (
    <ChapterDashboardContext.Provider value={value}>
      {children}
    </ChapterDashboardContext.Provider>
  );
}

export function useChapterDashboardContext() {
  const context = useContext(ChapterDashboardContext);

  if (!context) {
    throw new Error(
      "useChapterDashboardContext must be used within ChapterDashboardProvider",
    );
  }

  return context;
}
