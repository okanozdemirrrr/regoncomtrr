-- ==============================================================================
-- REGON â€” Åema AÅŸama 4 (Ã§ekirdek)
-- Tekrar Ã§alÄ±ÅŸtÄ±rÄ±labilir. Service role dÄ±ÅŸÄ±ndaki eriÅŸim RLS ile kapalÄ±.
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
-- TENANTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON public.tenants(is_active);

DROP TRIGGER IF EXISTS set_tenants_updated_at ON public.tenants;
CREATE TRIGGER set_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- PROJECTS (iÃ§erik kaynaÄŸÄ± projects.ts; DB iliÅŸki iÃ§in)
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
-- FEEDBACKS (ÅŸimdilik yalnÄ±zca ÅŸema â€” UI AÅŸama 5+)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'question')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'reviewing', 'planned', 'in_progress', 'done', 'rejected')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  idempotency_key VARCHAR(128),
  app_version VARCHAR(64),
  device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_tenant ON public.feedbacks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_project ON public.feedbacks(project_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

DROP TRIGGER IF EXISTS set_feedbacks_updated_at ON public.feedbacks;
CREATE TRIGGER set_feedbacks_updated_at
BEFORE UPDATE ON public.feedbacks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.feedback_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('tenant', 'admin')),
  author_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_comments_feedback
  ON public.feedback_comments(feedback_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_attachments_feedback
  ON public.feedback_attachments(feedback_id);

CREATE TABLE IF NOT EXISTS public.status_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_histories_feedback
  ON public.status_histories(feedback_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- API_KEYS / ADMIN_USERS (UI yok)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  key_hash VARCHAR(128) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_project ON public.api_keys(project_id);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin'
    CHECK (role IN ('superadmin', 'admin', 'support')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

DROP TRIGGER IF EXISTS set_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- RLS: aÃ§Ä±k + anon/authenticated iÃ§in politika yok (varsayÄ±lan reddet)
-- Deny-all politikalarÄ± savunma derinliÄŸi; service_role bypass eder.
-- ------------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projects are readable by all" ON public.projects;
DROP POLICY IF EXISTS "No access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "No access to projects" ON public.projects;
DROP POLICY IF EXISTS "No access to feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "No access to feedback_comments" ON public.feedback_comments;
DROP POLICY IF EXISTS "No access to feedback_attachments" ON public.feedback_attachments;
DROP POLICY IF EXISTS "No access to status_histories" ON public.status_histories;
DROP POLICY IF EXISTS "No access to api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "No access to admin_users" ON public.admin_users;

CREATE POLICY "No access to tenants" ON public.tenants FOR ALL USING (false);
CREATE POLICY "No access to projects" ON public.projects FOR ALL USING (false);
CREATE POLICY "No access to feedbacks" ON public.feedbacks FOR ALL USING (false);
CREATE POLICY "No access to feedback_comments" ON public.feedback_comments FOR ALL USING (false);
CREATE POLICY "No access to feedback_attachments" ON public.feedback_attachments FOR ALL USING (false);
CREATE POLICY "No access to status_histories" ON public.status_histories FOR ALL USING (false);
CREATE POLICY "No access to api_keys" ON public.api_keys FOR ALL USING (false);
CREATE POLICY "No access to admin_users" ON public.admin_users FOR ALL USING (false);
-- ==============================================================================
-- REGON â€” Portal aktivasyon kodu + oturum (AÅŸama 4)
-- Ã–nceki Ã§ekirdek migration'Ä±n Ã§alÄ±ÅŸtÄ±ÄŸÄ± varsayÄ±lÄ±r.
-- Eski activation_codes (v1) varsa kaldÄ±rÄ±lÄ±r ve yeniden oluÅŸturulur.
-- ==============================================================================

-- Eski v1 activation_codes (project_id sÃ¼tunlu) temizliÄŸi
DROP TABLE IF EXISTS public.activation_code_projects CASCADE;
DROP TABLE IF EXISTS public.portal_sessions CASCADE;
DROP TABLE IF EXISTS public.portal_login_attempts CASCADE;
DROP TABLE IF EXISTS public.activation_codes CASCADE;

CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code_hash VARCHAR(128) NOT NULL UNIQUE,
  code_hint VARCHAR(4),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  note TEXT
);

CREATE INDEX idx_activation_codes_hash ON public.activation_codes(code_hash);
CREATE INDEX idx_activation_codes_tenant ON public.activation_codes(tenant_id);
CREATE INDEX idx_activation_codes_status ON public.activation_codes(status);
CREATE INDEX idx_activation_codes_hint ON public.activation_codes(code_hint);

CREATE TABLE public.activation_code_projects (
  code_id UUID NOT NULL REFERENCES public.activation_codes(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  PRIMARY KEY (code_id, project_id)
);

CREATE INDEX idx_activation_code_projects_code ON public.activation_code_projects(code_id);
CREATE INDEX idx_activation_code_projects_project ON public.activation_code_projects(project_id);

CREATE TABLE public.portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code_id UUID REFERENCES public.activation_codes(id) ON DELETE SET NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  absolute_expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_hash VARCHAR(128),
  user_agent TEXT
);

CREATE INDEX idx_portal_sessions_tenant ON public.portal_sessions(tenant_id);
CREATE INDEX idx_portal_sessions_token ON public.portal_sessions(token_hash);
CREATE INDEX idx_portal_sessions_expires ON public.portal_sessions(expires_at);

CREATE TABLE public.portal_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash VARCHAR(128) NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portal_login_attempts_ip
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

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_code_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No access to activation_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "No access to activation_code_projects" ON public.activation_code_projects;
DROP POLICY IF EXISTS "No access to portal_sessions" ON public.portal_sessions;
DROP POLICY IF EXISTS "No access to portal_login_attempts" ON public.portal_login_attempts;

CREATE POLICY "No access to activation_codes" ON public.activation_codes FOR ALL USING (false);
CREATE POLICY "No access to activation_code_projects" ON public.activation_code_projects FOR ALL USING (false);
CREATE POLICY "No access to portal_sessions" ON public.portal_sessions FOR ALL USING (false);
CREATE POLICY "No access to portal_login_attempts" ON public.portal_login_attempts FOR ALL USING (false);
