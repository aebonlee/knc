import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { ADMIN_EMAILS } from '../config/admin';
import type { UserProfile } from '../types';
import site from '../config/site';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isLoggedIn: false,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser: User) => {
    if (!supabase || !authUser) {
      setProfile(null);
      return;
    }

    // 1) user_profiles 조회
    let { data: p } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // 2) OAuth 첫 로그인 시 프로필 자동 생성
    if (!p) {
      const meta = authUser.user_metadata || {};
      const { data: created } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.id,
          email: authUser.email || '',
          name: meta.full_name || meta.name || '',
          display_name: meta.full_name || meta.name || meta.preferred_username || '',
          avatar_url: meta.avatar_url || meta.picture || '',
          provider: authUser.app_metadata?.provider || 'email',
          role: 'member',
          signup_domain: site.url,
          visited_sites: [site.id],
        })
        .select()
        .single();
      if (created) p = created;
    }

    // 3) role 변환 + visited_sites 업데이트
    if (p) {
      if (p.role === 'user') p.role = 'member';

      // visited_sites에 현재 사이트 추가
      const visited = p.visited_sites || [];
      if (!visited.includes(site.id)) {
        const updated = [...visited, site.id];
        await supabase
          .from('user_profiles')
          .update({ visited_sites: updated })
          .eq('id', authUser.id);
        p.visited_sites = updated;
      }

      setProfile(p);
    }
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadProfile(u);
      }
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadProfile(u);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut({ scope: 'local' });
    setUser(null);
    setProfile(null);
  };

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || '');

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading,
        isLoggedIn: !!user,
        isAdmin,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
