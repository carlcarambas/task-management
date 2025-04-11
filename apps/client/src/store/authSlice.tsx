/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { StoreSlice } from '../types/store';
import { createJSONStorage, persist } from 'zustand/middleware';
// import Cookies from 'js-cookie';

type TErrorDetails = {
  message: string;
  description: string;
  status: number;
};

type TUser = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  isLoading: boolean;
  errorDetails?: TErrorDetails;
  user: TUser | null;
};

type AuthActions = {
  setIsLoading: (isLoading: boolean) => void;
  setErrorDetails: (errorDetails: TErrorDetails) => void;
  setUser: (user: TUser) => void;
  clearUser: () => void;
};

export type AuthSlice = AuthState & AuthActions;

const initialState: AuthState = {
  isLoading: false,
  errorDetails: undefined,
  user: null,
};

export const createAuthSlice: StoreSlice<AuthSlice> = (set: any) => ({
  ...initialState,
  setIsLoading: (isLoading: boolean) => {
    set(() => ({
      isLoading: isLoading,
    }));
  },
  setErrorDetails: (errorDetails: TErrorDetails) => {
    set(() => ({
      errorDetails: errorDetails,
    }));
  },
  setUser: (user: TUser) => {
    set(() => ({
      user: user,
    }));
  },
  clearUser: () => {
    set(() => ({
      user: null,
    }));
  },
});

export const useAuthStore = create<AuthSlice>()(
  persist(
    (set: any) => ({
      ...initialState,
      setIsLoading: (isLoading: boolean) => {
        set(() => ({
          isLoading: isLoading,
        }));
      },
      setErrorDetails: (errorDetails: TErrorDetails) => {
        set(() => ({
          errorDetails: errorDetails,
        }));
      },
      setUser: (user: TUser) => {
        set(() => ({
          user: user,
        }));
      },
      clearUser: () => {
        set(() => ({
          user: null,
        }));
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
