import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/shared/lib/supabase";
import type { MeetingAttachment } from "@features/meetings/types/meeting";

type AttachmentType = MeetingAttachment["type"];

function inferType(file: File): AttachmentType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  return "doc";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DbRow {
  id: string;
  meeting_id: number;
  name: string;
  type: string;
  size: number;
  storage_path: string;
  created_at: string;
}

function rowToAttachment(row: DbRow): MeetingAttachment {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AttachmentType,
    size: formatBytes(row.size),
    storagePath: row.storage_path,
    addedAt: new Date(row.created_at),
  };
}

export function useMeetingAttachments(meetingId: number) {
  const [attachments, setAttachments] = useState<MeetingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    const { data, error } = await supabase
      .from("meeting_attachments")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAttachments((data as DbRow[]).map(rowToAttachment));
    }
  }, [meetingId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      try {
        for (const file of files) {
          const path = `${meetingId}/${crypto.randomUUID()}-${file.name}`;

          const { error: storageError } = await supabase.storage
            .from("meeting-attachments")
            .upload(path, file);

          if (storageError) {
            console.error("Upload error:", storageError);
            continue;
          }

          const { error: dbError } = await supabase.from("meeting_attachments").insert({
            meeting_id: meetingId,
            name: file.name,
            type: inferType(file),
            size: file.size,
            storage_path: path,
          });

          if (dbError) {
            console.error("DB insert error:", dbError);
            await supabase.storage.from("meeting-attachments").remove([path]);
          }
        }
        await fetchAttachments();
      } finally {
        setIsUploading(false);
      }
    },
    [meetingId, fetchAttachments],
  );

  const deleteAttachment = useCallback(async (att: MeetingAttachment) => {
    await supabase.from("meeting_attachments").delete().eq("id", att.id);
    await supabase.storage.from("meeting-attachments").remove([att.storagePath]);
    setAttachments((prev) => prev.filter((a) => a.id !== att.id));
  }, []);

  const getSignedUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("meeting-attachments")
      .createSignedUrl(storagePath, 60 * 5);

    if (error) {
      console.error("Signed URL error:", error);
      return null;
    }
    return data.signedUrl;
  }, []);

  return { attachments, isUploading, uploadFiles, deleteAttachment, getSignedUrl };
}
