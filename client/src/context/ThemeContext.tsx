import { createContext, useContext, type ReactNode } from 'react'
import { useTheme, type Theme } from '../hooks/useTheme'

interface Ctx { theme: Theme; setTheme: (t: Theme) => void }

const ThemeContext = createContext<Ctx>(null!)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useTheme()
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useThemeCtx() {
  return useContext(ThemeContext)
}
