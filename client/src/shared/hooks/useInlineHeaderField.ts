import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

export interface UseInlineHeaderFieldOptions {
  initialValue: string;
  onCommit: (value: string) => void | Promise<void>;
  format?: (value: string) => string;
  isBulkEditing?: boolean;
  onBulkCommit?: () => void;
  onBulkCancel?: () => void;
}

export interface UseInlineHeaderFieldReturn {
  isEditing: boolean;
  draft: string;
  setDraft: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  startEditing: () => void;
  commit: () => void;
  cancel: () => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function useInlineHeaderField(
  options: UseInlineHeaderFieldOptions,
): UseInlineHeaderFieldReturn {
  const {
    initialValue,
    onCommit,
    format,
    isBulkEditing = false,
    onBulkCommit,
    onBulkCancel,
  } = options;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  const startEditing = useCallback(() => {
    setDraft(initialValue);
    setIsEditing(true);
  }, [initialValue]);

  const commit = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    const trimmed = draft.trim();
    if (trimmed && trimmed !== initialValue) {
      onCommit(trimmed);
    }
    setIsEditing(false);
  }, [draft, initialValue, onCommit]);

  const cancel = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsEditing(false);
    setDraft("");
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (isBulkEditing && onBulkCommit) {
          onBulkCommit();
        } else {
          commit();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (isBulkEditing && onBulkCancel) {
          onBulkCancel();
        } else {
          cancel();
        }
      }
    },
    [isBulkEditing, onBulkCommit, onBulkCancel, commit, cancel],
  );

  const handleBlur = useCallback(() => {
    if (isBulkEditing) return;
    blurTimeoutRef.current = window.setTimeout(() => {
      commit();
    }, 150);
  }, [isBulkEditing, commit]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = format ? format(e.target.value) : e.target.value;
      setDraft(value);
    },
    [format],
  );

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current && !isBulkEditing) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, isBulkEditing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  return {
    isEditing,
    draft,
    setDraft,
    inputRef,
    startEditing,
    commit,
    cancel,
    handleKeyDown,
    handleBlur,
    handleChange,
  };
}
