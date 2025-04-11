/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
// import { createCatalogSlice } from "./catalogSlice";
import { immer } from 'zustand/middleware/immer';
import { Store } from '../types/store';
import { createAuthSlice } from './authSlice';

export const useStore = create<Store>()(
  immer((...setterGetters) => ({
    ...createAuthSlice(...setterGetters),
  }))
);
