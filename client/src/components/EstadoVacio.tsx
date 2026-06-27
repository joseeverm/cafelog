import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  mensaje: string
  submensaje?: string
  accion?: React.ReactNode
}

export default function EstadoVacio({ icon: Icon = Inbox, mensaje, submensaje, accion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 opacity-60">
        <Icon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="text-zinc-700 dark:text-zinc-300 font-medium text-base">{mensaje}</p>
      {submensaje && (
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1.5 max-w-xs leading-relaxed">
          {submensaje}
        </p>
      )}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
