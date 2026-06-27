import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'gtavi'

const KEY = 'cafelog_theme'

function getInitial(): Theme {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'gtavi') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'gtavi')
    if (theme === 'dark') root.classList.add('dark')
    if (theme === 'gtavi') { root.classList.add('dark'); root.classList.add('gtavi') }
    localStorage.setItem(KEY, theme)
  }, [theme])

  return [theme, setTheme]
}
