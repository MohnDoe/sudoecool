import { DiscordAuth } from '@sudoecool/shared';
import { create } from 'zustand';


interface AuthState {
  auth: DiscordAuth | null;
  loading: boolean;
  error: string | null;


  // actions
  setAuth: (auth: DiscordAuth) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  loggout: () => void;
}
export const authStore = create<AuthState>((set) => ({
  auth: null,
  loading: true,
  error: null,

  setAuth: (auth) => set({ auth, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  loggout: () => set({ auth: null, error: null })
}));
