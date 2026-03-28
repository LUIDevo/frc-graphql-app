import { useNavigate, useLocation } from 'react-router-dom'
import { useEventStore, useUserStore } from '../../store/useStore'

interface LayoutProps {
  children: React.ReactNode
}

const NAV = [
  { label: 'Dashboard',         path: '/dashboard', icon: '⊞' },
  { label: 'Teams',             path: '/teams',     icon: '◫' },
  { label: 'Matches',           path: '/matches',   icon: '≡' },
  { label: 'Matchup Simulator', path: '/alliance',  icon: '✦', disabled: true },
  { label: 'Pick Strategy',     path: '/pickstrat', icon: '◈', disabled: true },
]

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { eventName, eventKey } = useEventStore()
  const { teamNumber } = useUserStore()

  function navStyle(path: string, disabled?: boolean) {
    const active = location.pathname === path || location.pathname.startsWith(path + '/')
    if (disabled) return { padding: '7px 10px', color: 'var(--text-muted)', opacity: 0.3, cursor: 'not-allowed' as const, border: '1px solid transparent' }
    if (active)   return { padding: '7px 9px',  background: 'rgba(239,68,68,0.11)', border: '1px solid rgba(239,68,68,0.28)', borderLeft: '2px solid #ef4444', color: 'var(--text)', fontWeight: 500 }
    return              { padding: '7px 10px', color: 'var(--text-soft)', border: '1px solid transparent' }
  }

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 220, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4" style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
          <div
            className="flex flex-col items-center justify-center flex-shrink-0"
            style={{ width: 32, height: 32, borderRadius: 7, background: 'linear-gradient(135deg,#991b1b 0%,#ef4444 55%,#fca5a5 100%)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)', gap: 0 }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'white', lineHeight: 1.15, letterSpacing: '0.04em' }}>66</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', lineHeight: 1.15, letterSpacing: '0.04em' }}>32</span>
          </div>
          <div>
            <div className="font-mono font-semibold" style={{ fontSize: 13, letterSpacing: '0.03em', lineHeight: 1.2, color: 'var(--text)' }}>
              PhoenixScouter
            </div>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.06em', marginTop: 1, color: 'var(--text-muted)' }}>
              FRC · 2026 Season
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col overflow-y-auto" style={{ padding: '10px 0' }}>
          {NAV.map(item => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => !item.disabled && navigate(item.path)}
                disabled={item.disabled}
                className="flex items-center gap-2.5 text-left transition-colors rounded-md"
                style={{ ...navStyle(item.path, item.disabled), margin: '1px 8px', fontSize: 13 }}
                onMouseEnter={e => { if (!item.disabled && !active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; } }}
                onMouseLeave={e => { if (!item.disabled && !active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-soft)'; } }}
              >
                <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0, opacity: active ? 1 : 0.7 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}

          <div className="flex-1" />

          {/* Event block */}
          {eventKey && (
            <div className="rounded-md flex flex-col" style={{ margin: '8px 12px', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 4 }}>
                Current Event
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 1 }}>{eventName || eventKey}</div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{eventKey}</div>
              <button
                className="text-left transition-colors"
                style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, display: 'block' }}
                onClick={() => navigate('/menu')}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                Change
              </button>
            </div>
          )}

          {/* Unmatched Logs */}
          <button
            onClick={() => navigate('/unmatched-logs')}
            className="flex items-center gap-2.5 text-left transition-colors rounded-md"
            style={{ ...navStyle('/unmatched-logs'), margin: '1px 8px', fontSize: 13 }}
            onMouseEnter={e => { if (!isActive('/unmatched-logs')) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; } }}
            onMouseLeave={e => { if (!isActive('/unmatched-logs')) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-soft)'; } }}
          >
            <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0, opacity: isActive('/unmatched-logs') ? 1 : 0.7 }}>⚠</span>
            Unmatched Logs
          </button>
        </nav>

        {/* Footer */}
        <div className="flex items-center gap-2.5" style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
          <div
            className="flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
            style={{ width: 28, height: 28, borderRadius: '50%', background: '#ca8a04' }}
          >
            {teamNumber ? String(teamNumber)[0] : 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>Team {teamNumber ?? '—'}</div>
            <div className="font-mono truncate" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Astro Falcons</div>
          </div>
          <button
            className="transition-colors flex-shrink-0"
            style={{ fontSize: 14, color: 'var(--text-muted)' }}
            onClick={() => navigate('/')}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-soft)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </main>

    </div>
  )
}
