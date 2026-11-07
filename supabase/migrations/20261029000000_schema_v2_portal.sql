-- ==============================================================================
-- REGON — Portal aktivasyon kodu + oturum (Aşama 4)
-- Önceki çekirdek migration'ın çalıştığı varsayılır.
-- Eski activation_codes (v1) varsa kaldırılır ve yeniden oluşturulur.
-- ==============================================================================

-- Eski v1 activation_codes (project_id sütunlu) temizliği
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
