import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { Compra } from '../types'
import PageHeader from '../components/PageHeader'
import FormularioCompra from '../components/FormularioCompra'

export default function NuevaCompra() {
  const { agregarCompra } = useApp()
  const navigate = useNavigate()

  function handleGuardar(datos: Omit<Compra, 'id'>) {
    agregarCompra(datos)
    navigate('/')
  }

  function handleGuardarNueva(datos: Omit<Compra, 'id'>) {
    agregarCompra(datos)
    window.location.reload()
  }

  return (
    <div>
      <PageHeader titulo="Nueva Compra" subtitulo="Registra una nueva compra de café" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-sm p-5">
          <FormularioCompra onGuardar={handleGuardar} onGuardarNueva={handleGuardarNueva} />
        </div>
      </div>
    </div>
  )
}
