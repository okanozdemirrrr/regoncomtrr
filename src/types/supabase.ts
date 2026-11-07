export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FeedbackType = 'bug' | 'feature' | 'general' | 'question'
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical'
export type FeedbackStatus =
  | 'received'
  | 'reviewing'
  | 'planned'
  | 'in_progress'
  | 'done'
  | 'rejected'
export type AuthorType = 'tenant' | 'admin'
export type AdminRole = 'superadmin' | 'admin' | 'support'
export type ProjectStatus = 'active' | 'beta' | 'archived'
export type ActivationCodeStatus = 'active' | 'revoked' | 'expired'

type Rel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string | null
          contact_email: string | null
          contact_phone: string | null
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          slug: string
          name: string
          status: ProjectStatus
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          status?: ProjectStatus
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
        Relationships: []
      }
      activation_codes: {
        Row: {
          id: string
          tenant_id: string
          code_hash: string
          code_hint: string | null
          status: ActivationCodeStatus
          expires_at: string | null
          created_at: string
          last_used_at: string | null
          revoked_at: string | null
          note: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          code_hash: string
          code_hint?: string | null
          status?: ActivationCodeStatus
          expires_at?: string | null
          created_at?: string
          last_used_at?: string | null
          revoked_at?: string | null
          note?: string | null
        }
        Update: Partial<Database['public']['Tables']['activation_codes']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'activation_codes_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      activation_code_projects: {
        Row: { code_id: string; project_id: string }
        Insert: { code_id: string; project_id: string }
        Update: never
        Relationships: Rel[]
      }
      portal_sessions: {
        Row: {
          id: string
          tenant_id: string
          code_id: string | null
          token_hash: string
          created_at: string
          last_seen_at: string
          expires_at: string
          absolute_expires_at: string
          revoked_at: string | null
          ip_hash: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          code_id?: string | null
          token_hash: string
          created_at?: string
          last_seen_at?: string
          expires_at: string
          absolute_expires_at: string
          revoked_at?: string | null
          ip_hash?: string | null
          user_agent?: string | null
        }
        Update: Partial<Database['public']['Tables']['portal_sessions']['Insert']>
        Relationships: Rel[]
      }
      portal_login_attempts: {
        Row: {
          id: string
          ip_hash: string
          success: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ip_hash: string
          success: boolean
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      feedbacks: {
        Row: {
          id: string
          tenant_id: string
          project_id: string
          type: FeedbackType
          title: string
          body: string
          severity: FeedbackSeverity
          status: FeedbackStatus
          is_read: boolean
          idempotency_key: string | null
          app_version: string | null
          device_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          project_id: string
          type: FeedbackType
          title: string
          body: string
          severity?: FeedbackSeverity
          status?: FeedbackStatus
          is_read?: boolean
          idempotency_key?: string | null
          app_version?: string | null
          device_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['feedbacks']['Insert']>
        Relationships: []
      }
      feedback_comments: {
        Row: {
          id: string
          feedback_id: string
          author_type: AuthorType
          author_name: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          author_type: AuthorType
          author_name: string
          message: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      feedback_attachments: {
        Row: {
          id: string
          feedback_id: string
          file_url: string
          file_name: string
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          file_url: string
          file_name: string
          file_size?: number | null
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      status_histories: {
        Row: {
          id: string
          feedback_id: string
          old_status: string | null
          new_status: string
          changed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          old_status?: string | null
          new_status: string
          changed_by: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      api_keys: {
        Row: {
          id: string
          project_id: string
          key_hash: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          key_hash: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['api_keys']['Insert']>
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string
          full_name: string
          role: AdminRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          email: string
          full_name: string
          role?: AdminRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      cleanup_old_login_attempts: { Args: Record<string, never>; Returns: undefined }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
