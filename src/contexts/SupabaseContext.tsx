import React, { createContext, useContext } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  }
  return context;
}

type SupabaseProviderProps = {
  supabase: SupabaseClient;
  session: Session | null;
  children: React.ReactNode;
};

export function SupabaseProvider({ supabase, session, children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
} 