import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventStore, useUserStore } from '../../store/useStore'
import { gql } from '@apollo/client/core'
import { useQuery, useMutation } from '@apollo/client/react'

const GET_MATCH_SCHEDULE = gql`
  query GetMatchSchedule($eventKey: String!) {
    getMatchSchedule(eventKey: $eventKey)
  }
`

const SYNC_MATCHES = gql`
  mutation SyncMatches($eventKey: String!) {
    syncMatches(eventKey: $eventKey)
  }
`

function parseMatchKey(matchKey: string): { id: string; title: string } {
  const code = matchKey.split('_').pop() ?? ''
  if (code.startsWith('qm')) {
    const n = code.slice(2)
    return { id: `Q${n}`, title: `Qualification Match ${n}` }
  }
  if (code.startsWith('sf')) {
    const m = code.match(/sf(\d+)m(\d+)/)
    return { id: `SF${m?.[1]}-${m?.[2]}`, title: `Semifinal ${m?.[1]} Match ${m?.[2]}` }
  }
  if (code.startsWith('f')) {
    const m = code.match(/f(\d+)m(\d+)/)
    return { id: `F${m?.[2]}`, title: `Finals Match ${m?.[2]}` }
  }
  return { id: code.toUpperCase(), title: code.toUpperCase() }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMatch(m: any, userTeamNumber: number | null): MatchData {
  const { id, title } = parseMatchKey(m.matchKey)
  const red: AllianceTeam[] = (m.redAlliance ?? []).map((t: any) => ({
    number: String(t.teamNumber),
    isYou: t.teamNumber === userTeamNumber,
  }))
  const blue: AllianceTeam[] = (m.blueAlliance ?? []).map((t: any) => ({
    number: String(t.teamNumber),
    isYou: t.teamNumber === userTeamNumber,
  }))
  const isYourMatch = [...red, ...blue].some(t => t.isYou)
  const scoutedTeams = new Set((m.scoutingData ?? []).map((s: any) => s.teamNumber))
  const allTeams = [...(m.redAlliance ?? []), ...(m.blueAlliance ?? [])].map((t: any) => t.teamNumber)
  const dots: DotState[] = allTeams.map(n => scoutedTeams.has(n) ? 'filled' : 'empty')
  const scoutedCount = dots.filter(d => d === 'filled').length
  const hasScore = m.redScore != null && m.blueScore != null && m.redScore >= 0 && m.blueScore >= 0
  const isLive = m.status === 'live'
  const isCompleted = m.status === 'completed'
  const winner = hasScore && isCompleted ? (m.redScore > m.blueScore ? 'red' : m.blueScore > m.redScore ? 'blue' : null) : null
  const diff = hasScore ? Math.abs(m.redScore - m.blueScore) : 0

  const badges: MatchData['badges'] = []
  if (isYourMatch) badges.push({ label: 'your match', type: 'your-match' })
  if (isLive) badges.push({ label: '● live', type: 'live' })
  else if (isCompleted && scoutedCount === 6) badges.push({ label: '● scouted', type: 'scouted' })
  else if (isCompleted && scoutedCount > 0) badges.push({ label: 'partial', type: 'partial' })
  else if (!isLive) badges.push({ label: 'unscouted', type: 'unscouted' })

  const subtitle = isLive
    ? 'In progress'
    : isCompleted && winner
    ? `${winner === 'red' ? 'Red' : 'Blue'} wins · +${diff} pts`
    : 'Upcoming'

  return {
    id, title, subtitle, badges, red, blue,
    redScore: hasScore ? String(m.redScore) : null,
    blueScore: hasScore ? String(m.blueScore) : null,
    winner, isLive,
    dots, scoutedCount,
    isYourMatch: isYourMatch || undefined,
    isUnscouted: (!isCompleted && !isLive && scoutedCount === 0) || undefined,
  }
}

type DotState = 'filled' | 'partial' | 'empty'

interface AllianceTeam { number: string; isYou?: boolean }

interface MatchData {
  id: string
  title: string
  subtitle: string
  badges: Array<{ label: string; type: 'scouted' | 'your-match' | 'live' | 'partial' | 'unscouted' }>
  red: AllianceTeam[]
  blue: AllianceTeam[]
  redScore: string | null
  blueScore: string | null
  winner: 'red' | 'blue' | null
  isLive?: boolean
  dots: DotState[]
  scoutedCount: number
  isYourMatch?: boolean
  isUnscouted?: boolean
}

const MATCHES: MatchData[] = [
  {
    id: 'Q1', title: 'Qualification Match 1', subtitle: 'Red wins · +27 pts',
    badges: [{ label: '● scouted', type: 'scouted' }],
    red: [{ number: '1114' }, { number: '854' }, { number: '5031' }],
    blue: [{ number: '2056' }, { number: '771' }, { number: '9262' }],
    redScore: '148', blueScore: '121', winner: 'red',
    dots: ['filled','filled','filled','filled','filled','filled'], scoutedCount: 6,
  },
  {
    id: 'Q2', title: 'Qualification Match 2', subtitle: 'Your match · partial scout coverage',
    badges: [{ label: 'your match', type: 'your-match' }, { label: '● live', type: 'live' }],
    red: [{ number: '6632', isYou: true }, { number: '4069' }, { number: '7558' }],
    blue: [{ number: '610' }, { number: '854' }, { number: '9262' }],
    redScore: null, blueScore: null, winner: null, isLive: true,
    dots: ['filled','filled','partial','empty','empty','empty'], scoutedCount: 3,
    isYourMatch: true,
  },
  {
    id: 'Q3', title: 'Qualification Match 3', subtitle: 'No scouts assigned · upcoming',
    badges: [{ label: 'unscouted', type: 'unscouted' }],
    red: [{ number: '2056' }, { number: '771' }, { number: '5031' }],
    blue: [{ number: '1114' }, { number: '4069' }, { number: '7558' }],
    redScore: null, blueScore: null, winner: null,
    dots: ['empty','empty','empty','empty','empty','empty'], scoutedCount: 0,
    isUnscouted: true,
  },
  {
    id: 'Q4', title: 'Qualification Match 4', subtitle: 'Blue wins · +28 pts',
    badges: [{ label: '● scouted', type: 'scouted' }],
    red: [{ number: '610' }, { number: '9262' }, { number: '854' }],
    blue: [{ number: '1114' }, { number: '7558' }, { number: '4069' }],
    redScore: '109', blueScore: '137', winner: 'blue',
    dots: ['filled','filled','filled','filled','filled','partial'], scoutedCount: 5,
  },
  {
    id: 'Q5', title: 'Qualification Match 5', subtitle: 'Red wins · +22 pts · 2 logs missing',
    badges: [{ label: 'partial', type: 'partial' }],
    red: [{ number: '5031' }, { number: '771' }, { number: '2056' }],
    blue: [{ number: '610' }, { number: '9262' }, { number: '854' }],
    redScore: '152', blueScore: '130', winner: 'red',
    dots: ['filled','filled','partial','partial','empty','empty'], scoutedCount: 4,
  },
]

function badgeStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'scouted':    return { background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)' }
    case 'your-match': return { background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }
    case 'live':       return { background: 'var(--c-amber-dim)', border: '1px solid var(--c-amber-border)', color: 'var(--c-amber)' }
    case 'partial':    return { background: 'var(--c-amber-dim)', border: '1px solid var(--c-amber-border)', color: 'var(--c-amber)' }
    case 'unscouted':  return { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-soft)' }
    default:           return {}
  }
}

function ScoutDot({ state }: { state: DotState }) {
  const s: React.CSSProperties = state === 'filled'
    ? { background: 'var(--green)', border: '1px solid var(--green-border)' }
    : state === 'partial'
    ? { background: 'var(--c-amber)', border: '1px solid var(--c-amber-border)' }
    : { background: 'transparent', border: '1px solid var(--border)' }
  return <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, ...s }} />
}

function MatchAvatar({ team, cardBg, index, total }: { team: AllianceTeam; cardBg: string; index: number; total: number }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div
      title={team.number}
      style={{
        width: 22, height: 22, borderRadius: '50%',
        marginLeft: index === 0 ? 0 : -7,
        zIndex: total - index,
        border: `2px solid ${cardBg}`,
        background: team.isYou ? 'var(--accent-dim)' : 'var(--surface3)',
        color: team.isYou ? 'var(--accent)' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 7, fontWeight: 600,
        flexShrink: 0, position: 'relative', overflow: 'hidden',
      }}
    >
      {!imgError
        ? <img src={`http://localhost:4000/avatar/${team.number}`} style={{ width: 22, height: 22, objectFit: 'cover' }} alt="" onError={() => setImgError(true)} />
        : team.number.slice(0, 2)
      }
    </div>
  )
}

// Stacked overlapping avatar circles for an alliance
function AvatarStack({ teams, cardBg }: { teams: AllianceTeam[]; cardBg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {teams.map((t, i) => (
        <MatchAvatar key={t.number} team={t} cardBg={cardBg} index={i} total={teams.length} />
      ))}
    </div>
  )
}

function MatchCard({ match, onClick }: { match: MatchData; onClick: () => void }) {
  const redWon = match.winner === 'red'
  const blueWon = match.winner === 'blue'
  const hasScore = match.redScore !== null && match.blueScore !== null
  const cardBg = match.isYourMatch ? 'color-mix(in srgb, var(--accent) 4%, var(--surface))' : 'var(--surface)'

  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg,
        border: `1px solid ${match.isYourMatch ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 0,
        cursor: 'pointer',
        opacity: match.isUnscouted ? 0.5 : 1,
        transition: 'border-color 0.14s, background 0.14s',
      }}
      onMouseEnter={e => { if (!match.isYourMatch) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; } }}
      onMouseLeave={e => { if (!match.isYourMatch) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; } }}
    >
      {/* ── Row 1: Match ID + badges ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="font-mono font-bold" style={{ fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em' }}>{match.id}</span>
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{match.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {match.badges.map(b => (
            <span key={b.label} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 20,
              fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 500,
              ...badgeStyle(b.type),
            }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Row 2: subtitle ── */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
        {match.subtitle}
      </div>

      {/* ── Row 3: Alliances ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Red alliance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-muted)', width: 26, flexShrink: 0 }}>RED</span>
            <AvatarStack teams={match.red} cardBg={match.isYourMatch ? 'color-mix(in srgb, var(--accent) 4%, var(--surface))' : 'var(--surface)'} />
            <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
              {match.red.map(t => (
                <span key={t.number} className="font-mono" style={{
                  fontSize: 11, color: t.isYou ? 'var(--accent)' : 'var(--text-soft)',
                  fontWeight: t.isYou ? 700 : 400,
                }}>{t.number}</span>
              ))}
            </div>
          </div>

          {/* Blue alliance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--text-muted)', width: 26, flexShrink: 0 }}>BLUE</span>
            <AvatarStack teams={match.blue} cardBg={match.isYourMatch ? 'color-mix(in srgb, var(--accent) 4%, var(--surface))' : 'var(--surface)'} />
            <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
              {match.blue.map(t => (
                <span key={t.number} className="font-mono" style={{
                  fontSize: 11, color: t.isYou ? 'var(--accent)' : 'var(--text-soft)',
                  fontWeight: t.isYou ? 700 : 400,
                }}>{t.number}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Score block */}
        <div className="font-mono" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, minWidth: 32 }}>
          {hasScore ? (
            <>
              <span style={{ fontSize: 15, lineHeight: 1, color: redWon ? 'var(--text)' : 'var(--text-muted)', fontWeight: redWon ? 700 : 400 }}>{match.redScore}</span>
              <span style={{ fontSize: 15, lineHeight: 1, color: blueWon ? 'var(--text)' : 'var(--text-muted)', fontWeight: blueWon ? 700 : 400 }}>{match.blueScore}</span>
            </>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'flex-end' }}>{match.isLive ? 'live' : '—'}</span>
          )}
        </div>
      </div>

      {/* ── Row 4: Coverage ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {match.dots.map((d, i) => <ScoutDot key={i} state={d} />)}
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 5 }}>
            {match.scoutedCount}/6 scouted
          </span>
        </div>
        <span
          className="font-mono"
          style={{ fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.12s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          onClick={e => { e.stopPropagation(); onClick() }}
        >
          View match →
        </span>
      </div>
    </div>
  )
}

function MatchRow({ match, onClick }: { match: MatchData; onClick: () => void }) {
  const redWon = match.winner === 'red'
  const blueWon = match.winner === 'blue'
  const hasScore = match.redScore !== null && match.blueScore !== null
  const cardBg = 'var(--surface)'

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '44px 1fr 70px auto auto',
        gap: 12,
        padding: '9px 14px',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        opacity: match.isUnscouted ? 0.45 : 1,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface2)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
    >
      {/* Match ID */}
      <span className="font-mono font-bold" style={{ fontSize: 13, color: match.isYourMatch ? 'var(--accent)' : 'var(--text)' }}>
        {match.id}
      </span>

      {/* Teams: two avatar+number rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <AvatarStack teams={match.red} cardBg={cardBg} />
          <div style={{ display: 'flex', gap: 5 }}>
            {match.red.map(t => (
              <span key={t.number} className="font-mono" style={{ fontSize: 11, color: t.isYou ? 'var(--accent)' : 'var(--text-soft)', fontWeight: t.isYou ? 700 : 400 }}>{t.number}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <AvatarStack teams={match.blue} cardBg={cardBg} />
          <div style={{ display: 'flex', gap: 5 }}>
            {match.blue.map(t => (
              <span key={t.number} className="font-mono" style={{ fontSize: 11, color: t.isYou ? 'var(--accent)' : 'var(--text-soft)', fontWeight: t.isYou ? 700 : 400 }}>{t.number}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="font-mono" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
        {hasScore ? (
          <>
            <span style={{ color: redWon ? 'var(--text)' : 'var(--text-muted)', fontWeight: redWon ? 700 : 400 }}>{match.redScore}</span>
            <span style={{ color: blueWon ? 'var(--text)' : 'var(--text-muted)', fontWeight: blueWon ? 700 : 400 }}>{match.blueScore}</span>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{match.isLive ? 'live' : '—'}</span>
        )}
      </div>

      {/* Scout dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {match.dots.map((d, i) => <ScoutDot key={i} state={d} />)}
      </div>

      {/* Status badge */}
      <div>
        {match.badges.slice(0, 1).map(b => (
          <span key={b.label} style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 20, fontFamily: 'var(--mono)',
            display: 'inline-flex', alignItems: 'center',
            ...badgeStyle(b.type),
          }}>{b.label}</span>
        ))}
      </div>
    </div>
  )
}

export default function Matches() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [view, setView] = useState<'card' | 'list'>('card')
  const { eventKey } = useEventStore()
  const { teamNumber: userTeamNumber } = useUserStore()
  const { data, loading, refetch } = useQuery(GET_MATCH_SCHEDULE, {
    variables: { eventKey },
    skip: !eventKey,
  })
  const [syncMatches, { loading: syncing }] = useMutation(SYNC_MATCHES)
  const matches: MatchData[] = (data?.getMatchSchedule ?? []).map((m: any) => mapMatch(m, parseInt(userTeamNumber)))

  async function handleSync() {
    await syncMatches({ variables: { eventKey } })
    refetch()
  }

  return (
    <div style={{ padding: '28px 32px' }}>

      {/* Header */}
      <div
        className="flex items-end justify-between gap-4 flex-wrap"
        style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)', marginBottom: 20 }}
      >
        <div>
          <div className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em', opacity: 0.8, marginBottom: 6 }}>
            Matches · 2026ontor
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Match Schedule
          </div>
        </div>

        <div className="flex gap-[6px] flex-wrap items-center">
          <input
            type="text"
            placeholder="Search…"
            className="font-mono outline-none"
            style={{
              borderRadius: 999, padding: '5px 13px',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 11,
            }}
          />

          {['All', 'My team', 'Unscouted'].map(label => (
            <button
              key={label}
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '5px 13px',
                borderRadius: 999, border: '1px solid',
                fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeFilter === label ? 'var(--accent-dim)' : 'transparent',
                borderColor: activeFilter === label ? 'var(--accent-border)' : 'var(--border)',
                color: activeFilter === label ? 'var(--accent)' : 'var(--text-soft)',
              }}
              onClick={() => setActiveFilter(label)}
            >
              {label}
            </button>
          ))}

          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 5, marginLeft: 4,
              fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', color: 'var(--c-red)',
            }}
            onClick={() => navigate('/unmatched-logs')}
          >
            ⚠ Unmatched <span className="font-mono font-bold">3</span>
          </button>

          {/* Refresh */}
          <button
            onClick={handleSync}
            disabled={syncing || !eventKey}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 5,
              fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, cursor: syncing ? 'wait' : 'pointer',
              background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)',
              opacity: syncing ? 0.6 : 1,
            }}
          >
            ↻ {syncing ? 'Syncing…' : 'Sync'}
          </button>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', marginLeft: 4 }}>
            <button
              title="Card view"
              onClick={() => setView('card')}
              style={{
                background: view === 'card' ? 'var(--surface2)' : 'transparent',
                border: 'none', padding: '5px 9px', cursor: 'pointer',
                color: view === 'card' ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 13, lineHeight: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              title="List view"
              onClick={() => setView('list')}
              style={{
                background: view === 'list' ? 'var(--surface2)' : 'transparent',
                border: 'none', padding: '5px 9px', cursor: 'pointer',
                color: view === 'list' ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 13, lineHeight: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Card view */}
      {view === 'card' && (
        <div className="flex flex-col gap-2">
          {loading && <div className="font-mono text-xs" style={{ color: 'var(--text-muted)', padding: '12px 0' }}>Loading…</div>}
          {matches.map(m => (
            <MatchCard key={m.id} match={m} onClick={() => navigate(`/matches/${m.id}`)} />
          ))}
          <div className="font-mono text-center" style={{ fontSize: 10, color: 'var(--text-muted)', padding: '16px 0', letterSpacing: '0.06em' }}>
            {matches.length} matches
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
          {/* Column headers */}
          <div
            className="font-mono uppercase"
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 70px auto auto',
              gap: 12,
              padding: '8px 14px',
              borderBottom: '1px solid var(--border)',
              fontSize: 9,
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              alignItems: 'center',
            }}
          >
            <span>Match</span>
            <span>Teams</span>
            <span>Score</span>
            <span>Coverage</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          <div>
            {matches.map((m, i) => (
              <div key={m.id} style={{ borderBottom: i === matches.length - 1 ? 'none' : undefined }}>
                <MatchRow match={m} onClick={() => navigate(`/matches/${m.id}`)} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="font-mono text-center"
            style={{ fontSize: 10, color: 'var(--text-muted)', padding: 10, borderTop: '1px solid var(--border)' }}
          >
            25 more matches · use filters to narrow results
          </div>
        </div>
      )}

    </div>
  )
}
