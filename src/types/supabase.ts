export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectStatus = 'active' | 'beta' | 'archived'
export type ActivationCodeStatus = 'active' | 'inactive'
export type TicketCategory = 'bug' | 'crash' | 'paid_revision'
export type TicketStatus = 'pending' | 'reviewing' | 'resolved'
export type MessageSender = 'customer' | 'admin'

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
          code: string
          project_id: string
          business_name: string
          status: ActivationCodeStatus
          note: string | null
          created_at: string
          last_used_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          project_id: string
          business_name: string
          status?: ActivationCodeStatus
          note?: string | null
          created_at?: string
          last_used_at?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['activation_codes']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'activation_codes_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      portal_sessions: {
        Row: {
          id: string
          activation_code_id: string
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
          activation_code_id: string
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
      tickets: {
        Row: {
          id: string
          activation_code_id: string
          project_id: string
          category: TicketCategory
          status: TicketStatus
          subject: string | null
          created_at: string
          updated_at: string
          last_message_at: string
        }
        Insert: {
          id?: string
          activation_code_id: string
          project_id: string
          category: TicketCategory
          status?: TicketStatus
          subject?: string | null
          created_at?: string
          updated_at?: string
          last_message_at?: string
        }
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>
        Relationships: Rel[]
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          sender: MessageSender
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender: MessageSender
          body?: string
          created_at?: string
        }
        Update: never
        Relationships: Rel[]
      }
      ticket_attachments: {
        Row: {
          id: string
          message_id: string
          ticket_id: string
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          ticket_id: string
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: never
        Relationships: Rel[]
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
