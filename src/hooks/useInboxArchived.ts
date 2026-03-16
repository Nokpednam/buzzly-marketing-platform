import { useState, useCallback, useEffect } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";

const STORAGE_KEY = "buzzly_inbox_archived";

function getArchived(workspaceId: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return new Set(parsed[workspaceId] ?? []);
  } catch {
    return new Set();
  }
}

function setArchived(workspaceId: string, postIds: Set<string>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    parsed[workspaceId] = Array.from(postIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export function useInboxArchived() {
  const { workspace } = useWorkspace();
  const [archived, setArchivedState] = useState<Set<string>>(() =>
    getArchived(workspace.id)
  );

  useEffect(() => {
    setArchivedState(getArchived(workspace.id));
  }, [workspace.id]);

  const archive = useCallback(
    (postId: string) => {
      const next = new Set(archived);
      next.add(postId);
      setArchivedState(next);
      setArchived(workspace.id, next);
    },
    [workspace.id, archived]
  );

  const unarchive = useCallback(
    (postId: string) => {
      const next = new Set(archived);
      next.delete(postId);
      setArchivedState(next);
      setArchived(workspace.id, next);
    },
    [workspace.id, archived]
  );

  const isArchived = useCallback(
    (postId: string) => archived.has(postId),
    [archived]
  );

  return { archive, unarchive, isArchived, archived };
}
