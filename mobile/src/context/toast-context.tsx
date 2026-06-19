import { createContext, useContext, useState } from 'react'
import { Toast } from '@molecules/toast'

interface ToastContextData {
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

const ToastContext = createContext({} as ToastContextData)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastData, setToastData] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning', active: boolean } | null>(null)

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    setToastData({ message, type, active: true })

    setTimeout(() => {
      setToastData(prev => prev?.active ? { ...prev, active: false } : null)
    }, 3000)
  }
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toastData?.message} type={toastData?.type} active={toastData?.active} onClose={() => setToastData(prev => prev ? { ...prev, active: false } : null)}/>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
