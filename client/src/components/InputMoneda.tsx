import { useState } from 'react'

const defaultCls =
  'w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-colors'

function fmt(value: string | number): string {
  const raw = typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''))
  return Number.isFinite(raw) && raw > 0 ? new Intl.NumberFormat('es-CO').format(raw) : ''
}

interface Props {
  value: string | number
  onChange: (raw: string) => void
  placeholder?: string
  className?: string
}

export default function InputMoneda({ value, onChange, placeholder = '0', className }: Props) {
  const [display, setDisplay] = useState(() => fmt(value))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setDisplay(fmt(raw))
    onChange(raw)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={className ?? defaultCls}
    />
  )
}
