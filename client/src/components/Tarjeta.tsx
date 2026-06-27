import type { LucideIcon } from 'lucide-react'

interface Props {
  titulo: string
  valor: string
  subtitulo?: string
  icon?: LucideIcon
  positivo?: boolean | null
}

export default function Tarjeta({ titulo, valor, subtitulo, icon: Icon, positivo }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {titulo}
          </p>
          <p
            className={`text-lg md:text-2xl font-bold mt-1.5 truncate leading-none ${
              positivo === true
                ? 'text-emerald-600 dark:text-emerald-400'
                : positivo === false
                ? 'text-red-500 dark:text-red-400'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {valor}
          </p>
          {subtitulo && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{subtitulo}</p>
          )}
        </div>
        {Icon && (
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </div>
        )}
      </div>
    </div>
  )
}
