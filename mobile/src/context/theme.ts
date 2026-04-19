import { createContext, useContext } from 'react'

// Recebe o tema atual do usuário com base no sistema operacional, mas também permite alternar entre temas claro e escuro
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
})

export function useTheme() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  return { theme, toggleTheme }
}