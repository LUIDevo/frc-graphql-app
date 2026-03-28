import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  teamNumber: string
  setTeamNumber: (n: string) => void
}

interface EventState {
  eventKey: string
  eventName: string
  setEventKey: (k: string) => void
  setEventName: (n: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      teamNumber: '',
      setTeamNumber: (teamNumber) => set({ teamNumber }),
    }),
    { name: 'user-store' }
  )
)

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      eventKey: '',
      eventName: '',
      setEventKey: (eventKey) => set({ eventKey }),
      setEventName: (eventName) => set({ eventName }),
    }),
    { name: 'event-store' }
  )
)
