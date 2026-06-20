import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  selectedRole: UserRole;
  login: (user: User, token: string) => void;
  logout: () => void;
  setSelectedRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedRole: 'worker',
      login: (user, token) => set({ user, token, selectedRole: user.role }),
      logout: () => set({ user: null, token: null }),
      setSelectedRole: (role) => set({ selectedRole: role }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
