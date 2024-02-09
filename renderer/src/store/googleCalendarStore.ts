import { createWithEqualityFn } from 'zustand/traditional';
import { googleCalendarStoreProps } from './types';

export const useGoogleCalendarStore =  createWithEqualityFn < googleCalendarStoreProps > (
  (set) => ({
    googleEvents: [],
    setGoogleEvents: (events) => set(() => ({ googleEvents: events })),
  }),
  Object.is
);
