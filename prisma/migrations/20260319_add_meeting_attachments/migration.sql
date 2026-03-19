CREATE TABLE public.meeting_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE meeting_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_attachments_select" ON meeting_attachments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "meeting_attachments_insert" ON meeting_attachments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "meeting_attachments_update" ON meeting_attachments
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "meeting_attachments_delete" ON meeting_attachments
  FOR DELETE TO authenticated USING (true);

-- Index
CREATE INDEX idx_meeting_attachments_meeting_id ON meeting_attachments(meeting_id);

-- Grants (match existing pattern)
GRANT SELECT, INSERT, UPDATE, DELETE ON meeting_attachments TO authenticated;
