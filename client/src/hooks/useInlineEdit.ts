import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ChangeEvent } from "react";

interface UseInlineEditOptions {
  initialValue: string;
  onCommit: (value: string) => void;
  formatValue?: (value: string) => string;
  blurCommitDelay?: number;
  suppressBlurCommit?: boolean;
}

interface UseInlineEditReturn {
  isEditing: boolean;
  draftValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  startEditing: () => void;
  setDraftValue: (value: string) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleFocus: () => void;
  commit: () => void;
  cancel: () => void;
  setIsEditing: (value: boolean) => void;
}

export function useInlineEdit({
  initialValue,
  onCommit,
  formatValue,
  blurCommitDelay = 150,
  suppressBlurCommit = false,
}: UseInlineEditOptions): UseInlineEditReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    setDraftValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current && !hasFocusedRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      hasFocusedRef.current = true;
    }
    if (!isEditing) {
      hasFocusedRef.current = false;
    }
  }, [isEditing]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const startEditing = useCallback(() => {
    setDraftValue(initialValue);
    setIsEditing(true);
    hasFocusedRef.current = false;
  }, [initialValue]);

  const commit = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    
    const trimmed = draftValue.trim();
    if (trimmed !== initialValue) {
      onCommit(trimmed);
    }
    setIsEditing(false);
  }, [draftValue, initialValue, onCommit]);

  const cancel = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsEditing(false);
    setDraftValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = formatValue ? formatValue(e.target.value) : e.target.value;
    setDraftValue(newValue);
  }, [formatValue]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }, [commit, cancel]);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (suppressBlurCommit) {
      return;
    }
    
    blurTimeoutRef.current = window.setTimeout(() => {
      commit();
    }, blurCommitDelay);
  }, [suppressBlurCommit, blurCommitDelay, commit]);

  return {
    isEditing,
    draftValue,
    inputRef,
    startEditing,
    setDraftValue,
    handleChange,
    handleKeyDown,
    handleBlur,
    handleFocus,
    commit,
    cancel,
    setIsEditing,
  };
}
