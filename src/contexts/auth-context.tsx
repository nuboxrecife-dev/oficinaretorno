'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization, Profile } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    userName: string;
    orgName: string;
    phone: string;
    email: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'oficina_retorno_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicialização da sessão
  useEffect(() => {
    async function initSession() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            await fetchProfileAndOrganization(session.user.id);
          }
        } else {
          // Fallback Local Storage para ambiente de dev sem Supabase
          const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            setUser(parsed.user);
            setProfile(parsed.profile);
            setOrganization(parsed.organization);
          } else {
            // Conta de demonstração inicial para teste imediato
            const demoOrg: Organization = {
              id: 'org-demo-123',
              name: 'Oficina Central Auto Services',
              slug: 'oficina-central-auto-services',
              phone: '(11) 99999-8888',
              email: 'contato@oficinacentral.com.br',
              created_at: new Date().toISOString(),
            };
            const demoProfile: Profile = {
              id: 'usr-demo-123',
              organization_id: demoOrg.id,
              name: 'Carlos Eduardo',
              email: 'carlos@oficinacentral.com.br',
              role: 'owner',
              created_at: new Date().toISOString(),
            };
            const demoUser = { id: demoProfile.id, email: demoProfile.email };
            
            setUser(demoUser);
            setProfile(demoProfile);
            setOrganization(demoOrg);
            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify({ user: demoUser, profile: demoProfile, organization: demoOrg })
            );
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar sessão:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  async function fetchProfileAndOrganization(userId: string) {
    try {
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profErr || !profData) return;

      setProfile(profData);

      const { data: orgData, error: orgErr } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profData.organization_id)
        .single();

      if (!orgErr && orgData) {
        setOrganization(orgData);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do perfil e organização:', err);
    }
  }

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          await fetchProfileAndOrganization(data.user.id);
          return { success: true };
        }
      }

      // Local Fallback Sign In
      const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setOrganization(parsed.organization);
      } else {
        const mockOrg: Organization = {
          id: `org-${Date.now()}`,
          name: 'Oficina Mecânica Modelo',
          slug: 'oficina-mecanica-modelo',
          phone: '(11) 98888-7777',
          email,
          created_at: new Date().toISOString(),
        };
        const mockProfile: Profile = {
          id: `usr-${Date.now()}`,
          organization_id: mockOrg.id,
          name: email.split('@')[0],
          email,
          role: 'owner',
          created_at: new Date().toISOString(),
        };
        const mockUser = { id: mockProfile.id, email };

        setUser(mockUser);
        setProfile(mockProfile);
        setOrganization(mockOrg);

        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ user: mockUser, profile: mockProfile, organization: mockOrg })
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao realizar login.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp: AuthContextType['signUp'] = async (data) => {
    setLoading(true);
    try {
      const orgSlug = slugify(data.orgName);

      if (isSupabaseConfigured && data.password) {
        // 1. Criar Usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: data.userName },
          },
        });

        if (authError || !authData.user) {
          return { success: false, error: authError?.message || 'Erro ao criar usuário no Supabase Auth.' };
        }

        const newUserId = authData.user.id;

        // 2. Criar Organização
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: data.orgName,
            slug: orgSlug,
            phone: data.phone,
            email: data.email,
          })
          .select()
          .single();

        if (orgError || !orgData) {
          return { success: false, error: orgError?.message || 'Erro ao registrar organização.' };
        }

        // 3. Criar Perfil vinculado à Organização como Owner
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            organization_id: orgData.id,
            name: data.userName,
            email: data.email,
            role: 'owner',
          })
          .select()
          .single();

        if (profError || !profData) {
          return { success: false, error: profError?.message || 'Erro ao criar perfil.' };
        }

        setUser({ id: newUserId, email: data.email });
        setProfile(profData);
        setOrganization(orgData);

        return { success: true };
      }

      // Local Fallback Sign Up
      const newOrgId = `org-${Date.now()}`;
      const newUserId = `usr-${Date.now()}`;

      const newOrg: Organization = {
        id: newOrgId,
        name: data.orgName,
        slug: orgSlug,
        phone: data.phone,
        email: data.email,
        created_at: new Date().toISOString(),
      };

      const newProf: Profile = {
        id: newUserId,
        organization_id: newOrgId,
        name: data.userName,
        email: data.email,
        role: 'owner',
        created_at: new Date().toISOString(),
      };

      const newUser = { id: newUserId, email: data.email };

      setUser(newUser);
      setProfile(newProf);
      setOrganization(newOrg);

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ user: newUser, profile: newProf, organization: newOrg })
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao realizar cadastro.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUser(null);
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        organization,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
