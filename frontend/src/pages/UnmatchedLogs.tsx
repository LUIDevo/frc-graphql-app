import { useState } from 'react'
import { gql } from '@apollo/client/core'
import { useQuery, useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { useEventStore } from '../../store/useStore'

const GET_UNMATCHED_LOGS = gql`
  query GetUnmatchedLogs($eventKey: String!) {
    getUnmatchedLogs(eventKey: $eventKey) {
      id
      matchNumber
      teamNumber
      scoutName
      autoNotes
      notes
      autoFuel
      teleopFuel
      missed
      climbLevel
      autoClimb
      penalties
      totalPoints
      reason
      createdAt
    }
  }
`

const RESOLVE_LOG = gql`
  mutation ResolveUnmatchedLog($id: ID!, $matchNumber: Int!, $teamNumber: Int!) {
    resolveUnmatchedLog(id: $id, matchNumber: $matchNumber, teamNumber: $teamNumber) {
      id
      matchNumber
      teamNumber
    }
  }
`

const DELETE_LOG = gql`
  mutation DeleteUnmatchedLog($id: ID!) {
    deleteUnmatchedLog(id: $id)
  }
`

interface UnmatchedLog {
  id: string
  matchNumber: number
  teamNumber: number
  scoutName: string | null
  autoNotes: string | null
  notes: string | null
  autoFuel: number | null
  teleopFuel: number | null
  missed: number | null
  climbLevel: string | null
  autoClimb: boolean | null
  penalties: number | null
  totalPoints: number | null
  reason: string | null
  createdAt: string
}

export default function UnmatchedLogs() {
  const navigate = useNavigate()
  const { eventKey } = useEventStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, { matchNumber: string; teamNumber: string }>>({})
  const [resolveError, setResolveError] = useState<Record<string, string>>({})

  const { data, loading, refetch } = useQuery(GET_UNMATCHED_LOGS, {
    variables: { eventKey },
    skip: !eventKey,
  })

  const [resolveLog] = useMutation(RESOLVE_LOG)
  const [deleteLog] = useMutation(DELETE_LOG)

  const logs: UnmatchedLog[] = data?.getUnmatchedLogs ?? []

  function getOverride(id: string) {
    return overrides[id] ?? { matchNumber: '', teamNumber: '' }
  }

  function setOverride(id: string, field: 'matchNumber' | 'teamNumber', value: string) {
    setOverrides(prev => ({ ...prev, [id]: { ...getOverride(id), [field]: value } }))
  }

  async function handleResolve(log: UnmatchedLog) {
    const { matchNumber, teamNumber } = getOverride(log.id)
    const mn = parseInt(matchNumber) || log.matchNumber
    const tn = parseInt(teamNumber) || log.teamNumber
    setResolveError(prev => ({ ...prev, [log.id]: '' }))
    try {
      await resolveLog({ variables: { id: log.id, matchNumber: mn, teamNumber: tn } })
      await refetch()
    } catch (e: any) {
      setResolveError(prev => ({ ...prev, [log.id]: e.message ?? 'Unknown error' }))
    }
  }

  async function handleDelete(id: string) {
    await deleteLog({ variables: { id } })
    await refetch()
  }

  if (!eventKey) {
    return (
      <div className="p-8" style={{ color: 'var(--text-soft)' }}>
        No event selected.{' '}
        <button
          className="underline transition-colors"
          style={{ color: 'var(--accent)' }}
          onClick={() => navigate('/menu')}
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-6" style={{ color: 'var(--text)' }}>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
          Unmatched Logs
        </p>
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          Unmatched Scouting Logs
        </h1>
        <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{eventKey}</p>
      </div>

      {loading && (
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      )}

      {!loading && logs.length === 0 && (
        <div
          className="rounded-lg p-6 text-center text-sm"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          No unmatched logs — all scouting data was matched successfully.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {logs.map(log => {
          const isExpanded = expanded === log.id
          const override = getOverride(log.id)
          const err = resolveError[log.id]

          return (
            <div
              key={log.id}
              className="rounded-lg overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {/* Header row */}
              <button
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 transition-colors"
                style={{ color: 'var(--text)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => setExpanded(isExpanded ? null : log.id)}
              >
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span style={{ color: 'var(--c-red)', fontWeight: 600 }}>M{log.matchNumber}</span>
                  <span style={{ color: 'var(--c-blue)' }}>#{log.teamNumber}</span>
                  {log.scoutName && <span style={{ color: 'var(--text-soft)' }}>{log.scoutName}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs truncate max-w-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                    {log.reason}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 flex flex-col gap-4 pt-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  {/* Reason */}
                  <p className="font-mono text-xs" style={{ color: 'var(--c-amber)' }}>{log.reason}</p>

                  {/* Scouting data */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>Auto Fuel: <span style={{ color: 'var(--text)' }}>{log.autoFuel ?? '—'}</span></span>
                    <span>Teleop Fuel: <span style={{ color: 'var(--text)' }}>{log.teleopFuel ?? '—'}</span></span>
                    <span>Missed: <span style={{ color: 'var(--text)' }}>{log.missed ?? '—'}</span></span>
                    <span>Climb: <span style={{ color: 'var(--text)' }}>{log.climbLevel ?? '—'}</span></span>
                    <span>Auto Climb: <span style={{ color: 'var(--text)' }}>{log.autoClimb != null ? (log.autoClimb ? 'Yes' : 'No') : '—'}</span></span>
                    <span>Penalties: <span style={{ color: 'var(--text)' }}>{log.penalties ?? '—'}</span></span>
                    <span>Total Pts: <span style={{ color: 'var(--text)' }}>{log.totalPoints ?? '—'}</span></span>
                  </div>

                  {log.autoNotes && (
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Auto notes: </span>
                      <span style={{ color: 'var(--text-soft)' }}>{log.autoNotes}</span>
                    </div>
                  )}
                  {log.notes && (
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Notes: </span>
                      <span style={{ color: 'var(--text-soft)' }}>{log.notes}</span>
                    </div>
                  )}

                  {/* Resolution controls */}
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Correct &amp; Match
                    </p>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>Match #</label>
                        <input
                          type="number"
                          placeholder={String(log.matchNumber)}
                          value={override.matchNumber}
                          onChange={e => setOverride(log.id, 'matchNumber', e.target.value)}
                          className="rounded-[5px] px-2 py-1.5 font-mono text-xs w-24 outline-none transition-colors"
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--accent-border)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>Team #</label>
                        <input
                          type="number"
                          placeholder={String(log.teamNumber)}
                          value={override.teamNumber}
                          onChange={e => setOverride(log.id, 'teamNumber', e.target.value)}
                          className="rounded-[5px] px-2 py-1.5 font-mono text-xs w-24 outline-none transition-colors"
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--accent-border)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        />
                      </div>
                      <button
                        className="px-3 py-1.5 text-white text-xs font-mono rounded-[5px] transition-colors"
                        style={{ background: 'var(--accent)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                        onClick={() => handleResolve(log)}
                      >
                        Match &amp; Save
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-mono rounded-[5px] transition-colors"
                        style={{
                          background: 'var(--surface2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-soft)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--danger-dim)'
                          e.currentTarget.style.borderColor = 'var(--danger-border)'
                          e.currentTarget.style.color = 'var(--c-red)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--surface2)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = 'var(--text-soft)'
                        }}
                        onClick={() => handleDelete(log.id)}
                      >
                        Discard
                      </button>
                    </div>
                    {err && <p className="font-mono text-xs" style={{ color: 'var(--c-red)' }}>{err}</p>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
