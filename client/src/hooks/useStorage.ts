import { useState, useEffect } from 'react'

export function useStorage<T>(key: string, valorInicial: T): [T, (valor: T) => void] {
  const [estado, setEstado] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(estado))
    } catch {
      // localStorage no disponible
    }
  }, [key, estado])

  return [estado, setEstado]
}
