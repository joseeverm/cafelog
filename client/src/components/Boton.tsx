import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro' | 'ghost'
  tamaño?: 'sm' | 'md' | 'lg'
  cargando?: boolean
}

const variantes = {
  primario:
    'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white shadow-sm dark:bg-amber-500 dark:hover:bg-amber-400',
  secundario:
    'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:bg-zinc-200 dark:active:bg-zinc-600',
  peligro:
    'bg-red-500 hover:bg-red-400 active:bg-red-600 text-white shadow-sm',
  ghost:
    'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700',
}

const tamaños = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
}

export default function Boton({
  variante = 'primario',
  tamaño = 'md',
  cargando,
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || cargando}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantes[variante]} ${tamaños[tamaño]} ${className}
      `}
    >
      {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
