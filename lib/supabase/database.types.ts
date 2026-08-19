export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      holdings: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
      transactions: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
      profiles: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
      projects: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
      signals: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
      admin_allowlist: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
      user_roles: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
      admin_audit_log: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, string>
    CompositeTypes: Record<string, never>
  }
}
