import { create } from 'zustand'
import type { TripData, TripState } from '@/src/websocket/use-trip-events'

interface RacingState {
  tripState: TripState
  tripData: Partial<TripData>
  setTripState: (state: TripState) => void
  setTripData: (data: Partial<TripData>) => void
}

export const useRacingStore = create<RacingState>((set) => ({
  tripState: 'idle',
  tripData: { tripId: null },

  setTripState: (state) => set({ tripState: state }),
  setTripData: (data) => set((state) => ({
    tripData: {
      ...state.tripData,
      ...data
    }
  }))
}))