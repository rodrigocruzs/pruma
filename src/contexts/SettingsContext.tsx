import React, { createContext, useEffect, useState } from 'react';
import { useSupabaseContext } from './SupabaseContext';
import type { CompanySettings, UserProfile } from '../../types/supabase';

type SettingsContextType = {
  companySettings: CompanySettings | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { supabase, session } = useSupabaseContext();
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setCompanySettings(null);
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    async function loadSettings() {
      const userId = session!.user.id;
      try {
        setIsLoading(true);
        
        // Load or create company settings
        let { data: companyData, error: companyError } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (companyError) {
          if (companyError.code === 'PGRST116') {
            // No company settings found, create them
            const { data: newCompanyData, error: createError } = await supabase
              .from('company_settings')
              .insert([{ user_id: userId }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating company settings:', createError);
              throw createError;
            }
            companyData = newCompanyData;
          } else {
            console.error('Error loading company settings:', companyError);
            throw companyError;
          }
        }
        setCompanySettings(companyData);

        // Load or create user profile
        let { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No user profile found, create it
            const { data: newProfileData, error: createError } = await supabase
              .from('user_profiles')
              .insert([{ user_id: userId }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating user profile:', createError);
              throw createError;
            }
            profileData = newProfileData;
          } else {
            console.error('Error loading user profile:', profileError);
            throw profileError;
          }
        }
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error in loadSettings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [session?.user, supabase]);

  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    if (!session?.user) {
      console.error('No active session found when trying to update company settings');
      throw new Error('You must be logged in to update company settings');
    }

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .update(settings)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }

      setCompanySettings(data);
    } catch (error) {
      console.error('Error in updateCompanySettings:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!session?.user) {
      console.error('No active session found when trying to update user profile');
      throw new Error('You must be logged in to update user profile');
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profile)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
      setUserProfile(data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        companySettings,
        userProfile,
        isLoading,
        updateCompanySettings,
        updateUserProfile,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
} 