-- ==============================================================================
-- REGON — Destek Portalı (aktivasyon kodu 3 harf + 3 rakam, talepler, sohbet, storage)
-- Tekrar çalıştırılabilir. Service role dışındaki erişim RLS ile kapalı.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'beta', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.projects (slug, name, status)
VALUES
  ('regon-pos', 'Regon POS', 'active'),
  ('regon-kurye', 'Regon Kurye', 'active'),
  ('regon-bayi', 'Regon Bayi', 'active'),
  ('regon-market', 'Regon Market', 'active')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- ACTIVATION CODES (3 harf + 3 rakam, örn. RGN104)
-- Eski hash tabanlı şema kaldırılır.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.activation_code_projects CASCADE;
DROP TABLE IF EXISTS public.portal_sessions CASCADE;
DROP TABLE IF EXISTS public.ticket_attachments CASCADE;
DROP TABLE IF EXISTS public.ticket_messages CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.activation_codes CASCADE;

CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) NOT NULL UNIQUE
    CHECK (code ~ '^[A-Z]{3}[0-9]{3}$'),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  business_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX idx_activation_codes_project ON public.activation_codes(project_id);
CREATE INDEX idx_activation_codes_status ON public.activation_codes(status);

DROP TRIGGER IF EXISTS set_activation_codes_updated_at ON public.activation_codes;
CREATE TRIGGER set_activation_codes_updated_at
BEFORE UPDATE ON public.activation_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- PORTAL SESSIONS + LOGIN ATTEMPTS
-- ------------------------------------------------------------------------------
CREATE TABLE public.portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_code_id UUID NOT NULL REFERENCES public.activation_codes(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  absolute_expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_hash VARCHAR(128),
  user_agent TEXT
);

CREATE INDEX idx_portal_sessions_code ON public.portal_sessions(activation_code_id);
CREATE INDEX idx_portal_sessions_token ON public.portal_sessions(token_hash);
CREATE INDEX idx_portal_sessions_expires ON public.portal_sessions(expires_at);

CREATE TABLE IF NOT EXISTS public.portal_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash VARCHAR(128) NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_login_attempts_ip
  ON public.portal_login_attempts(ip_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.portal_login_attempts
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ------------------------------------------------------------------------------
-- TICKETS / MESSAGES / ATTACHMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_code_id UUID NOT NULL REFERENCES public.activation_codes(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  category VARCHAR(32) NOT NULL
    CHECK (category IN ('bug', 'crash', 'paid_revision')),
  status VARCHAR(32) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved')),
  subject VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_code ON public.tickets(activation_code_id);
CREATE INDEX idx_tickets_project ON public.tickets(project_id);
CREATE INDEX idx_tickets_category ON public.tickets(category);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_last_message ON public.tickets(last_message_at DESC);
CREATE INDEX idx_tickets_crash_priority
  ON public.tickets(category, last_message_at DESC)
  WHERE category = 'crash';

DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.tickets;
CREATE TRIGGER set_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('customer', 'admin')),
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket
  ON public.ticket_messages(ticket_id, created_at ASC);

CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.ticket_messages(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  mime_type VARCHAR(100) NOT NULL
    CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp', 'application/pdf')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_attachments_message ON public.ticket_attachments(message_id);
CREATE INDEX idx_ticket_attachments_ticket ON public.ticket_attachments(ticket_id);

-- ------------------------------------------------------------------------------
-- REALTIME (opsiyonel; uygulama polling ile de çalışır)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;

-- ------------------------------------------------------------------------------
-- STORAGE: support-attachments
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "No public read support attachments" ON storage.objects;
DROP POLICY IF EXISTS "No public write support attachments" ON storage.objects;
DROP POLICY IF EXISTS "No public update support attachments" ON storage.objects;
DROP POLICY IF EXISTS "No public delete support attachments" ON storage.objects;

-- Anon/authenticated doğrudan erişemez; uygulama service role ile yükler/imzalı URL üretir.
CREATE POLICY "No public read support attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'support-attachments' AND false);

CREATE POLICY "No public write support attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'support-attachments' AND false);

CREATE POLICY "No public update support attachments"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'support-attachments' AND false);

CREATE POLICY "No public delete support attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'support-attachments' AND false);

-- ------------------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No access to projects" ON public.projects;
DROP POLICY IF EXISTS "No access to activation_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "No access to portal_sessions" ON public.portal_sessions;
DROP POLICY IF EXISTS "No access to portal_login_attempts" ON public.portal_login_attempts;
DROP POLICY IF EXISTS "No access to tickets" ON public.tickets;
DROP POLICY IF EXISTS "No access to ticket_messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "No access to ticket_attachments" ON public.ticket_attachments;

CREATE POLICY "No access to projects" ON public.projects FOR ALL USING (false);
CREATE POLICY "No access to activation_codes" ON public.activation_codes FOR ALL USING (false);
CREATE POLICY "No access to portal_sessions" ON public.portal_sessions FOR ALL USING (false);
CREATE POLICY "No access to portal_login_attempts" ON public.portal_login_attempts FOR ALL USING (false);
CREATE POLICY "No access to tickets" ON public.tickets FOR ALL USING (false);
CREATE POLICY "No access to ticket_messages" ON public.ticket_messages FOR ALL USING (false);
CREATE POLICY "No access to ticket_attachments" ON public.ticket_attachments FOR ALL USING (false);
