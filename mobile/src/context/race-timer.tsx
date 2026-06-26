import { createContext, useEffect, useState } from 'react'

export const RaceTimerContext = createContext<{
  timer: number
  startTimer: () => void
  resetTimer: () => void
}>({timer: 0, startTimer: () => {}, resetTimer: () => {}})

export const RaceTimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [ timer, setTimer ] = useState<number>(0)
  const [ isRunning, setIsRunning ] = useState<boolean>(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const startTimer = () => { setIsRunning(true) }
  const resetTimer = () => { setIsRunning(false); setTimer(0) }

  return (
    <RaceTimerContext.Provider value={{ timer, startTimer, resetTimer }}>
      {children}
    </RaceTimerContext.Provider>
  )
}
