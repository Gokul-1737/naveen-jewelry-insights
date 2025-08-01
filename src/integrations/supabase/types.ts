export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leave_amounts: {
        Row: {
          amount: number
          buyer_name: string
          created_at: string
          id: string
          leave_date: string
          notes: string | null
          product_name: string
          product_type: string
          product_weight_grams: number
          quantity: number
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_name: string
          created_at?: string
          id?: string
          leave_date?: string
          notes?: string | null
          product_name: string
          product_type: string
          product_weight_grams?: number
          quantity?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_name?: string
          created_at?: string
          id?: string
          leave_date?: string
          notes?: string | null
          product_name?: string
          product_type?: string
          product_weight_grams?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          buyer_name: string
          created_at: string
          id: string
          notes: string | null
          product_name: string
          product_type: string
          product_weight_grams: number
          purchase_date: string
          quantity: number
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_name: string
          created_at?: string
          id?: string
          notes?: string | null
          product_name: string
          product_type: string
          product_weight_grams?: number
          purchase_date?: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          product_name?: string
          product_type?: string
          product_weight_grams?: number
          purchase_date?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          balance_amount: number | null
          buyer_name: string
          created_at: string
          given_amount: number | null
          id: string
          notes: string | null
          product_name: string
          product_type: string
          product_weight_grams: number | null
          quantity: number
          sale_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          balance_amount?: number | null
          buyer_name: string
          created_at?: string
          given_amount?: number | null
          id?: string
          notes?: string | null
          product_name: string
          product_type: string
          product_weight_grams?: number | null
          quantity?: number
          sale_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          balance_amount?: number | null
          buyer_name?: string
          created_at?: string
          given_amount?: number | null
          id?: string
          notes?: string | null
          product_name?: string
          product_type?: string
          product_weight_grams?: number | null
          quantity?: number
          sale_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock: {
        Row: {
          created_at: string
          id: string
          product_name: string
          product_type: string
          product_weight_grams: number
          quantity_available: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_name: string
          product_type: string
          product_weight_grams?: number
          quantity_available?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_name?: string
          product_type?: string
          product_weight_grams?: number
          quantity_available?: number
          updated_at?: string
        }
        Relationships: []
      }
      stock_maintenance: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
