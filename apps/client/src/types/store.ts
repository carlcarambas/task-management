import { StateCreator } from 'zustand';
import { AuthSlice } from '../store/authSlice';

export type Store = AuthSlice;
export type StoreSlice<T> = StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  T
>;
