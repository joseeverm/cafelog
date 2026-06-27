import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  titulo: string
  abierto: boolean
  onCerrar: () => void
  children: ReactNode
  tamaño?: 'sm' | 'md' | 'lg'
}

const tamaños = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ titulo, abierto, onCerrar, children, tamaño = 'md' }: Props) {
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCerrar} />
      <div
        className={`
          relative w-full ${tamaños[tamaño]} z-10
          bg-white dark:bg-zinc-900
          border border-zinc-300 dark:border-zinc-800
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          max-h-[92vh] flex flex-col
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
