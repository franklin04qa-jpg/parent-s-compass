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
      diary_entries: {
        Row: {
          created_at: string
          description: string
          emotion: Database["public"]["Enums"]["emotion_type"]
          entry_date: string
          id: string
          photo_url: string | null
          profile_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          emotion: Database["public"]["Enums"]["emotion_type"]
          entry_date?: string
          id?: string
          photo_url?: string | null
          profile_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          emotion?: Database["public"]["Enums"]["emotion_type"]
          entry_date?: string
          id?: string
          photo_url?: string | null
          profile_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          child_birthdate: string
          child_gender: string | null
          child_name: string
          child_photo_url: string | null
          created_at: string
          id: string
          main_challenge: string | null
          parent_name: string
          user_id: string
        }
        Insert: {
          child_birthdate: string
          child_gender?: string | null
          child_name: string
          child_photo_url?: string | null
          created_at?: string
          id?: string
          main_challenge?: string | null
          parent_name: string
          user_id: string
        }
        Update: {
          child_birthdate?: string
          child_gender?: string | null
          child_name?: string
          child_photo_url?: string | null
          created_at?: string
          id?: string
          main_challenge?: string | null
          parent_name?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_strategies: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          strategy_id: string
          worked: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          strategy_id: string
          worked?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          strategy_id?: string
          worked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "saved_strategies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_strategies_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          age_max: number
          age_min: number
          audio_url: string | null
          category: Database["public"]["Enums"]["strategy_category"]
          created_at: string
          creator_id: string
          id: string
          is_weekly_boost: boolean
          published: boolean
          script_text: string | null
          strategy_text: string
          title: string
        }
        Insert: {
          age_max?: number
          age_min?: number
          audio_url?: string | null
          category: Database["public"]["Enums"]["strategy_category"]
          created_at?: string
          creator_id: string
          id?: string
          is_weekly_boost?: boolean
          published?: boolean
          script_text?: string | null
          strategy_text: string
          title: string
        }
        Update: {
          age_max?: number
          age_min?: number
          audio_url?: string | null
          category?: Database["public"]["Enums"]["strategy_category"]
          created_at?: string
          creator_id?: string
          id?: string
          is_weekly_boost?: boolean
          published?: boolean
          script_text?: string | null
          strategy_text?: string
          title?: string
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
      emotion_type:
        | "happy"
        | "difficult"
        | "proud"
        | "frustrated"
        | "celebration"
      strategy_category:
        | "meltdown"
        | "sleep"
        | "eating"
        | "listening"
        | "discipline"
      user_type: "parent" | "creator"
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
    Enums: {
      emotion_type: [
        "happy",
        "difficult",
        "proud",
        "frustrated",
        "celebration",
      ],
      strategy_category: [
        "meltdown",
        "sleep",
        "eating",
        "listening",
        "discipline",
      ],
      user_type: ["parent", "creator"],
    },
  },
} as const
