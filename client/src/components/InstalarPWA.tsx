import { useEffect, useState } from 'react'
import { Share, Plus, X, Download } from 'lucide-react'

const CLAVE_DESCARTADO = 'cafelog_pwa_prompt_dismissed'

/** El evento `beforeinstallprompt` no está en los tipos del DOM todavía. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Safari en iOS expone `navigator.standalone`; el resto de navegadores no. */
type NavegadorIOS = Navigator & { standalone?: boolean }

function yaInstalada(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavegadorIOS).standalone === true
  )
}

/** iOS Safari: excluye Chrome (CriOS), Firefox (FxiOS) y Edge (EdgiOS). */
function esIOSSafari(): boolean {
  const ua = window.navigator.userAgent
  const esIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ se identifica como Mac; se delata por el táctil
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  return esIOS && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
}

export default function InstalarPWA() {
  const [visible, setVisible] = useState(false)
  const [modo, setModo] = useState<'ios' | 'android'>('ios')
  const [promptInstalar, setPromptInstalar] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (localStorage.getItem(CLAVE_DESCARTADO) === '1') return
    if (yaInstalada()) return

    // Android / Chrome de escritorio: el navegador avisa cuándo se puede instalar
    const alPoderInstalar = (e: Event) => {
      e.preventDefault() // sin esto, Chrome muestra su propio mini-infobar
      setPromptInstalar(e as BeforeInstallPromptEvent)
      setModo('android')
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', alPoderInstalar)

    // iOS Safari nunca dispara ese evento: la instalación es manual
    if (esIOSSafari()) {
      setModo('ios')
      setVisible(true)
    }

    // Si el usuario instala, el banner ya no aplica
    const alInstalar = () => setVisible(false)
    window.addEventListener('appinstalled', alInstalar)

    return () => {
      window.removeEventListener('beforeinstallprompt', alPoderInstalar)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  const descartar = () => {
    localStorage.setItem(CLAVE_DESCARTADO, '1')
    setVisible(false)
  }

  const instalar = async () => {
    if (!promptInstalar) return
    await promptInstalar.prompt()
    const { outcome } = await promptInstalar.userChoice
    setPromptInstalar(null)
    if (outcome === 'accepted') setVisible(false)
    else descartar()
  }

  if (!visible) return null

  return (
    <div className="pwa-banner fixed left-3 right-3 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start gap-3 rounded-xl bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-500/40 px-3.5 py-3 shadow-lg">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
          <Download className="w-4 h-4 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
            Instala CaféLog
          </p>

          {modo === 'ios' ? (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Toca el botón Compartir
              <Share className="inline-block w-3.5 h-3.5 mx-1 -mt-0.5 text-amber-600 dark:text-amber-400" />
              y luego
              <Plus className="inline-block w-3.5 h-3.5 mx-1 -mt-0.5 text-amber-600 dark:text-amber-400" />
              «Agregar a pantalla de inicio».
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tenla a mano en tu pantalla de inicio y ábrela como una app.
              </p>
              <button
                type="button"
                onClick={instalar}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar app
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={descartar}
          aria-label="Descartar"
          className="shrink-0 -mt-0.5 -mr-1 p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
