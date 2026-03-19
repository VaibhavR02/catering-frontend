import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

// ── PROVIDER ───────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // ── ADD TOAST ──────────────────────────────────────────
  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now()

    setToasts(prev => [...prev, { id, msg, type }])

    // Auto-remove after 3.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  // ── TOAST HELPERS ──────────────────────────────────────
  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  }

  const ICONS = {
    success: '✓',
    error:   '✕',
    info:    '●',
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* ── TOAST CONTAINER ─────────────────────────────── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background:
                t.type === 'success' ? 'var(--green)'  :
                t.type === 'error'   ? 'var(--red)'    :
                'var(--ember)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
            }}>
              {ICONS[t.type]}
            </span>
            <span>{t.msg}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                padding: '0 2px',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── HOOK ───────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}