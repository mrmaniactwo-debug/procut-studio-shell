/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ProjectData = {
  title: string;
  zoom: number; // timeline zoom in px per segment (mock)
  updatedAt?: number;
};

export type ProjectState = {
  data: ProjectData;
  saving: boolean;
  dirty: boolean;
  autosaveEnabled: boolean;
  lastSavedAt?: number;
  setTitle: (t: string) => void;
  setZoom: (z: number) => void;
  toggleAutosave: () => void;
  saveNow: () => Promise<void>;
  exportProject: () => void;
};

const DEFAULT_PROJECT: ProjectData = {
  title: "Untitled Project",
  zoom: 192,
  updatedAt: undefined,
};

const STORAGE_KEY = "procut-project";

const ProjectContext = createContext<ProjectState | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ProjectData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ProjectData;
    } catch (e) {
      // ignore storage parsing errors
    }
    return DEFAULT_PROJECT;
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>(data.updatedAt);

  const saveToStorage = useCallback(async (d: ProjectData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 250)); // simulate IO
    const payload: ProjectData = { ...d, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSavedAt(payload.updatedAt);
    setSaving(false);
    setDirty(false);
  }, []);

  const debounced = useRef<number | null>(null);

  // Debounce save whenever data changes and autosave is enabled and dirty
  useEffect(() => {
    if (!autosaveEnabled || !dirty) return;
    if (debounced.current) window.clearTimeout(debounced.current);
    debounced.current = window.setTimeout(() => {
      saveToStorage(data);
      debounced.current = null;
    }, 800);
    return () => {
      if (debounced.current) window.clearTimeout(debounced.current);
    };
  }, [data, dirty, autosaveEnabled, saveToStorage]);

  const setTitle = useCallback((t: string) => {
    setData((prev) => ({ ...prev, title: t }));
    setDirty(true);
  }, []);

  const setZoom = useCallback((z: number) => {
    setData((prev) => ({ ...prev, zoom: z }));
    setDirty(true);
  }, []);

  const toggleAutosave = useCallback(() => setAutosaveEnabled((a) => !a), []);

  const saveNow = useCallback(async () => {
    await saveToStorage(data);
  }, [data, saveToStorage]);

  const exportProject = useCallback(() => {
    const blob = new Blob([JSON.stringify({ ...data, exportedAt: Date.now() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `procut-project-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [data]);

  const value = useMemo<ProjectState>(() => ({
    data,
    saving,
    dirty,
    autosaveEnabled,
    lastSavedAt,
    setTitle,
    setZoom,
    toggleAutosave,
    saveNow,
    exportProject,
  }), [data, saving, dirty, autosaveEnabled, lastSavedAt, setTitle, setZoom, toggleAutosave, saveNow, exportProject]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
};
