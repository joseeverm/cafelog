interface Props {
  estado: 'humedo' | 'seco' | 'abierto' | 'vendido'
}

const config = {
  humedo: {
    label: 'Húmedo',
    clase: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  },
  seco: {
    label: 'Seco',
    clase: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  },
  abierto: {
    label: 'Abierto',
    clase: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  vendido: {
    label: 'Vendido',
    clase: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  },
}

export default function BadgeEstado({ estado }: Props) {
  const { label, clase } = config[estado]
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${clase}`}>
      {label}
    </span>
  )
}
