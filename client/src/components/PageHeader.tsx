interface Props {
  titulo: string
  subtitulo?: string
  accion?: React.ReactNode
}

export default function PageHeader({ titulo, subtitulo, accion }: Props) {
  return (
    <div className="page-header relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{titulo}</h1>
        {subtitulo && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitulo}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}
