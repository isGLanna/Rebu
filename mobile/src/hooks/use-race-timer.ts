import { useContext } from 'react'
import { RaceTimerContext } from '@context/race-timer'

export const useRaceTimer = () => useContext(RaceTimerContext)