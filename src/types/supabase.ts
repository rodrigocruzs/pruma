export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
  public: {
    Tables: {
      company_settings: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          id: string
          razao_social: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          razao_social?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          razao_social?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      NotaFiscal: {
        Row: {
          arquivo_path: string | null
          chave_nfe: string | null
          created_at: string
          created_by: string
          data_emissao: string | null
          id: string
          status_validacao: string | null
        }
        Insert: {
          arquivo_path?: string | null
          chave_nfe?: string | null
          created_at?: string
          created_by: string
          data_emissao?: string | null
          id?: string
          status_validacao?: string | null
        }
        Update: {
          arquivo_path?: string | null
          chave_nfe?: string | null
          created_at?: string
          created_by?: string
          data_emissao?: string | null
          id?: string
          status_validacao?: string | null
        }
        Relationships: []
      }
      Pagamento: {
        Row: {
          comissao: number | null
          created_at: string
          created_by: string
          data: string
          id: string
          mes_referente: string | null
          nf_id: string | null
          prestador_id: string
          status: string
          valor: number
        }
        Insert: {
          comissao?: number | null
          created_at?: string
          created_by: string
          data?: string
          id?: string
          mes_referente?: string | null
          nf_id?: string | null
          prestador_id: string
          status?: string
          valor: number
        }
        Update: {
          comissao?: number | null
          created_at?: string
          created_by?: string
          data?: string
          id?: string
          mes_referente?: string | null
          nf_id?: string | null
          prestador_id?: string
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "Pagamento_nf_id_fkey"
            columns: ["nf_id"]
            isOneToOne: true
            referencedRelation: "NotaFiscal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Pagamento_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "PrestadorPJ"
            referencedColumns: ["id"]
          },
        ]
      }
      PrestadorPJ: {
        Row: {
          ativo: boolean
          chave_pix: string | null
          cnpj: string | null
          contrato_path: string | null
          created_at: string
          created_by: string
          data_inicio: string
          email: string
          endereco_cidade: string | null
          endereco_logradouro: string | null
          funcao: string | null
          id: string
          nascimento: string | null
          nome: string
          razao_social: string | null
          remuneracao: number
          sobrenome: string
          status_contrato: string
          telefone_contato: string | null
        }
        Insert: {
          ativo?: boolean
          chave_pix?: string | null
          cnpj?: string | null
          contrato_path?: string | null
          created_at?: string
          created_by: string
          data_inicio: string
          email: string
          endereco_cidade?: string | null
          endereco_logradouro?: string | null
          funcao?: string | null
          id?: string
          nascimento?: string | null
          nome: string
          razao_social?: string | null
          remuneracao: number
          sobrenome: string
          status_contrato?: string
          telefone_contato?: string | null
        }
        Update: {
          ativo?: boolean
          chave_pix?: string | null
          cnpj?: string | null
          contrato_path?: string | null
          created_at?: string
          created_by?: string
          data_inicio?: string
          email?: string
          endereco_cidade?: string | null
          endereco_logradouro?: string | null
          funcao?: string | null
          id?: string
          nascimento?: string | null
          nome?: string
          razao_social?: string | null
          remuneracao?: number
          sobrenome?: string
          status_contrato?: string
          telefone_contato?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          prestador_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          prestador_id?: string | null
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          prestador_id?: string | null
          role?: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
