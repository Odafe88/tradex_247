export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      card_deposits: {
        Row: {
          amount: number
          bank_name: string
          card_holder_name: string
          card_type: string | null
          created_at: string
          id: string
          last_four_digits: string
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          bank_name: string
          card_holder_name: string
          card_type?: string | null
          created_at?: string
          id?: string
          last_four_digits: string
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          bank_name?: string
          card_holder_name?: string
          card_type?: string | null
          created_at?: string
          id?: string
          last_four_digits?: string
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          chain: string
          created_at: string
          id: string
          status: string
          transaction_hash: string
          updated_at: string
          user_id: string
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          amount: number
          chain: string
          created_at?: string
          id?: string
          status?: string
          transaction_hash: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          amount?: number
          chain?: string
          created_at?: string
          id?: string
          status?: string
          transaction_hash?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance_crypto: number | null
          balance_forex: number | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          total_profit: number | null
          updated_at: string
        }
        Insert: {
          balance_crypto?: number | null
          balance_forex?: number | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          total_profit?: number | null
          updated_at?: string
        }
        Update: {
          balance_crypto?: number | null
          balance_forex?: number | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          total_profit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          asset_name: string
          asset_symbol: string
          created_at: string
          current_value: number
          end_time: string
          id: string
          initial_amount: number
          is_active: boolean
          start_time: string
          trade_type: string
          user_id: string
        }
        Insert: {
          asset_name: string
          asset_symbol: string
          created_at?: string
          current_value: number
          end_time: string
          id?: string
          initial_amount: number
          is_active?: boolean
          start_time?: string
          trade_type: string
          user_id: string
        }
        Update: {
          asset_name?: string
          asset_symbol?: string
          created_at?: string
          current_value?: number
          end_time?: string
          id?: string
          initial_amount?: number
          is_active?: boolean
          start_time?: string
          trade_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_trade_atomic: {
        Args: {
          p_asset_name: string
          p_asset_symbol: string
          p_end_time: string
          p_initial_amount: number
          p_start_time: string
          p_trade_type: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
