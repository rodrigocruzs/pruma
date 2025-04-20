export type CompanySettings = {
  id: string;
  user_id: string;
  company_name: string | null;
  razao_social: string | null;
  cnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  created_at: string;
  updated_at: string;
}

export type UserProfile = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      company_settings: {
        Row: CompanySettings;
        Insert: Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}; 