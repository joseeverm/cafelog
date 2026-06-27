import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NuevaCompra from './pages/NuevaCompra'
import Lotes from './pages/Lotes'
import Historial from './pages/Historial'
import Configuracion from './pages/Configuracion'
import { Coffee } from 'lucide-react'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400 dark:text-zinc-500">
          <Coffee className="w-8 h-8 animate-pulse" />
          <span className="text-sm">Cargando…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Login />

  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nueva-compra" element={<NuevaCompra />} />
            <Route path="/lotes" element={<Lotes />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}
