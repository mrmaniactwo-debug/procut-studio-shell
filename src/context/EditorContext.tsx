/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

type EditorContextType = {
  timelinePlayheadSec: number;
  setTimelinePlayheadSec: (s: number) => void;
  timelineDurationSec: number;
  setTimelineDurationSec: (s: number) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timelinePlayheadSec, setTimelinePlayheadSec] = useState<number>(0);
  const [timelineDurationSec, setTimelineDurationSec] = useState<number>(60);

  const value = useMemo(
    () => ({
      timelinePlayheadSec,
      setTimelinePlayheadSec,
      timelineDurationSec,
      setTimelineDurationSec,
    }),
    [timelinePlayheadSec, timelineDurationSec]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
};
