import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventStore, useUserStore } from '../../store/useStore'
import { gql } from '@apollo/client/core'
import { useQuery, useMutation } from '@apollo/client/react'

const SYNC_TEAMS = gql`
  mutation SyncTeams($eventKey: String!) {
    syncTeams(eventKey: $eventKey)
  }
`

const GET_ALL_TEAM_INFO = gql`
query GetAllTeamInfo($eventKey: String!) {
	getAllTeamInfo(eventKey: $eventKey) {
				teamNumber
        nickname
        rank
        wins
        losses
        opr
        calculatedEPA
        rankingPoints
        scoutingDataCount
        endgameReliability
        totalClimbL1
        totalClimbL2
        totalClimbL3
        totalClimbFail
	}
}
`
interface Team {
  rank: number
  number: string
  name: string
  initials: string
  avatarBg: string
  avatarBorder: string
  avatarColor: string
  record: string
  opr: string
  epa: string
  climb: string
  logs: number
  snippet: string
  details: {
    opr: string; epa: string; avgFuel: string
    wl: string; rp: string; rankOf: string
    climbLevel: string; climbRate: string
    logsCount: string; coverage: string
  }
  isYou?: boolean
}

// const TEAMS: Team[] = [
//   {
//     rank: 1, number: '1114', name: 'Simbotics', initials: 'SB', logs: 10,
//     avatarBg: 'rgba(99,102,241,0.12)', avatarBorder: 'rgba(99,102,241,0.25)', avatarColor: '#a5b4fc',
//     record: '9–1', opr: '247.3', epa: '198', climb: 'L3',
//     snippet: 'Avg 12.4 fuel / match · consistent auto · strong endgame',
//     details: { opr:'247.3', epa:'198', avgFuel:'12.4', wl:'9–1', rp:'28', rankOf:'#1 of 25', climbLevel:'L3', climbRate:'100%', logsCount:'10', coverage:'100%' },
//   },
//   {
//     rank: 2, number: '2056', name: 'OP Robotics', initials: 'OP', logs: 9,
//     avatarBg: 'rgba(34,211,238,0.10)', avatarBorder: 'rgba(34,211,238,0.22)', avatarColor: '#67e8f9',
//     record: '8–2', opr: '231.8', epa: '182', climb: 'L3',
//     snippet: 'Avg 11.1 fuel / match · reliable auto · L3 every match',
//     details: { opr:'231.8', epa:'182', avgFuel:'11.1', wl:'8–2', rp:'24', rankOf:'#2 of 25', climbLevel:'L3', climbRate:'90%', logsCount:'9', coverage:'90%' },
//   },
//   {
//     rank: 3, number: '610', name: 'Crescent Crew', initials: 'CC', logs: 8,
//     avatarBg: 'rgba(59,130,246,0.12)', avatarBorder: 'rgba(59,130,246,0.25)', avatarColor: '#93c5fd',
//     record: '8–2', opr: '198.4', epa: '165', climb: 'L3',
//     snippet: 'Avg 9.8 fuel / match · fast intake · strong defense capability',
//     details: { opr:'198.4', epa:'165', avgFuel:'9.8', wl:'8–2', rp:'24', rankOf:'#3 of 25', climbLevel:'L3', climbRate:'80%', logsCount:'8', coverage:'80%' },
//   },
//   {
//     rank: 4, number: '4069', name: 'WARHawks', initials: 'WH', logs: 6,
//     avatarBg: 'rgba(251,146,60,0.10)', avatarBorder: 'rgba(251,146,60,0.22)', avatarColor: '#fdba74',
//     record: '7–3', opr: '184.7', epa: '151', climb: 'L2',
//     snippet: 'Avg 9.1 fuel / match · inconsistent L2 climb · good teleop scorer',
//     details: { opr:'184.7', epa:'151', avgFuel:'9.1', wl:'7–3', rp:'22', rankOf:'#4 of 25', climbLevel:'L2', climbRate:'67%', logsCount:'6', coverage:'60%' },
//   },
//   {
//     rank: 5, number: '6632', name: 'Astro Falcons', initials: 'AF', logs: 4,
//     avatarBg: 'rgba(59,130,246,0.12)', avatarBorder: 'rgba(59,130,246,0.30)', avatarColor: 'var(--accent)',
//     record: '7–3', opr: '176.2', epa: '144', climb: 'L3',
//     snippet: 'Avg 8.6 fuel / match · your team · 4 logs submitted',
//     details: { opr:'176.2', epa:'144', avgFuel:'8.6', wl:'7–3', rp:'20', rankOf:'#5 of 25', climbLevel:'L3', climbRate:'70%', logsCount:'4', coverage:'40%' },
//     isYou: true,
//   },
//   {
//     rank: 6, number: '771', name: 'SWAT', initials: 'SW', logs: 7,
//     avatarBg: 'rgba(167,139,250,0.10)', avatarBorder: 'rgba(167,139,250,0.22)', avatarColor: '#c4b5fd',
//     record: '6–4', opr: '163.9', epa: '138', climb: 'L2',
//     snippet: 'Avg 7.9 fuel / match · aggressive defender · occasional L2',
//     details: { opr:'163.9', epa:'138', avgFuel:'7.9', wl:'6–4', rp:'18', rankOf:'#6 of 25', climbLevel:'L2', climbRate:'57%', logsCount:'7', coverage:'70%' },
//   },
//   {
//     rank: 7, number: '5031', name: 'Patriots', initials: 'PT', logs: 5,
//     avatarBg: 'rgba(52,211,153,0.10)', avatarBorder: 'rgba(52,211,153,0.22)', avatarColor: '#6ee7b7',
//     record: '6–4', opr: '159.1', epa: '130', climb: 'L1',
//     snippet: 'Avg 7.4 fuel / match · L1 only · strong ground intake',
//     details: { opr:'159.1', epa:'130', avgFuel:'7.4', wl:'6–4', rp:'18', rankOf:'#7 of 25', climbLevel:'L1', climbRate:'80%', logsCount:'5', coverage:'50%' },
//   },
//   {
//     rank: 8, number: '854', name: 'Ti-84s', initials: 'TI', logs: 3,
//     avatarBg: 'rgba(244,63,94,0.10)', avatarBorder: 'rgba(244,63,94,0.22)', avatarColor: '#fda4af',
//     record: '5–5', opr: '148.3', epa: '122', climb: 'L1',
//     snippet: 'Avg 6.8 fuel / match · defense specialist · slow climber',
//     details: { opr:'148.3', epa:'122', avgFuel:'6.8', wl:'5–5', rp:'14', rankOf:'#8 of 25', climbLevel:'L1', climbRate:'60%', logsCount:'3', coverage:'30%' },
//   },
// ]

function TeamAvatar({ teamNumber, initials, size, bg, border, color }: {
  teamNumber: string; initials: string; size: number
  bg: string; border: string; color: string
}) {
  const [imgError, setImgError] = useState(false)
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 font-mono font-semibold"
      style={{ width: size, height: size, borderRadius: size <= 28 ? 5 : 7, border: `1px solid ${border}`, color, fontSize: size <= 28 ? 9 : 10 }}
    >
      {!imgError
        ? <img src={`http://localhost:4000/avatar/${teamNumber}`} style={{ width: size - 8, height: size - 8, borderRadius: 4, objectFit: 'cover' }} alt="" onError={() => setImgError(true)} />
        : initials
      }
    </div>
  )
}

const AVATAR_PALETTE = [
  { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  color: '#a5b4fc' },
  { bg: 'rgba(34,211,238,0.10)',  border: 'rgba(34,211,238,0.22)',  color: '#67e8f9' },
  { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  color: '#93c5fd' },
  { bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.22)',  color: '#fdba74' },
  { bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.22)', color: '#c4b5fd' },
  { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)',  color: '#6ee7b7' },
  { bg: 'rgba(244,63,94,0.10)',   border: 'rgba(244,63,94,0.22)',   color: '#fda4af' },
  { bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.22)',  color: '#fde047' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeam(t: any, index: number, userTeamNumber: number | null): Team {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length]
  const nickname = t.nickname ?? `Team ${t.teamNumber}`
  const isYou = t.teamNumber === userTeamNumber
  const totalClimbs = (t.totalClimbL1 ?? 0) + (t.totalClimbL2 ?? 0) + (t.totalClimbL3 ?? 0) + (t.totalClimbFail ?? 0)
  const climbRate = totalClimbs > 0 ? Math.round(((t.totalClimbL1 ?? 0) + (t.totalClimbL2 ?? 0) + (t.totalClimbL3 ?? 0)) / totalClimbs * 100) : 0
  const climb = (t.totalClimbL3 ?? 0) > 0 ? 'L3' : (t.totalClimbL2 ?? 0) > 0 ? 'L2' : (t.totalClimbL1 ?? 0) > 0 ? 'L1' : '—'
  return {
    rank: t.rank ?? index + 1,
    number: String(t.teamNumber),
    name: nickname,
    initials: nickname.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    avatarBg: isYou ? 'rgba(239,68,68,0.12)' : palette.bg,
    avatarBorder: isYou ? 'rgba(239,68,68,0.30)' : palette.border,
    avatarColor: isYou ? 'var(--accent)' : palette.color,
    record: `${t.wins ?? 0}–${t.losses ?? 0}`,
    opr: t.opr != null ? t.opr.toFixed(1) : '—',
    epa: t.calculatedEPA != null ? String(Math.round(t.calculatedEPA)) : '—',
    climb,
    logs: t.scoutingDataCount ?? 0,
    snippet: [t.opr != null ? `OPR ${t.opr.toFixed(1)}` : null, climb !== '—' ? `${climb} climb` : null, `${t.scoutingDataCount ?? 0} logs`].filter(Boolean).join(' · '),
    details: {
      opr: t.opr != null ? t.opr.toFixed(1) : '—',
      epa: t.calculatedEPA != null ? String(Math.round(t.calculatedEPA)) : '—',
      avgFuel: '—',
      wl: `${t.wins ?? 0}–${t.losses ?? 0}`,
      rp: String(t.rankingPoints ?? 0),
      rankOf: t.rank != null ? `#${t.rank}` : '—',
      climbLevel: climb,
      climbRate: `${climbRate}%`,
      logsCount: String(t.scoutingDataCount ?? 0),
      coverage: '—',
    },
    isYou,
  }
}

function climbColor(level: string) {
  if (level === 'L3') return 'var(--green)'
  if (level === 'L2') return 'var(--c-amber)'
  return 'var(--text-muted)'
}

function TeamCard({ team }: { team: Team }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  return (
    <div
      style={{
        background: team.isYou ? 'rgba(239,68,68,0.03)' : 'var(--surface)',
        border: `1px solid ${team.isYou ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '16px 18px',
        transition: 'border-color 0.14s, background 0.14s',
      }}
      onMouseEnter={e => { if (!team.isYou) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; } }}
      onMouseLeave={e => { if (!team.isYou) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; } }}
    >
      {/* Main row */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        {/* Left: avatar + identity */}
        <div className="flex items-center gap-3">
          <TeamAvatar teamNumber={team.number} initials={team.initials} size={36}  border={team.avatarBorder}/>
					{/*<TeamAvatar teamNumber={team.number} initials={team.initials} size={36} bg={team.avatarBg} border={team.avatarBorder} color={team.avatarColor} />*/}
          <div className="flex flex-col gap-[3px]">
            {/* Title line: rank · number · name · [you] */}
            <div className="flex items-baseline gap-[7px]">
              <span
                className="font-mono"
                style={{ fontSize: 11, color: team.isYou ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                #{team.rank}
              </span>
              <span
                className="font-mono font-bold"
                style={{ fontSize: 15, color: team.isYou ? 'var(--accent)' : 'var(--text)' }}
              >
                {team.number}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-soft)', fontWeight: 400 }}>{team.name}</span>
              {team.isYou && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: 9, padding: '1px 6px', borderRadius: 999,
                    background: 'rgba(239,68,68,0.12)', color: 'var(--accent)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  you
                </span>
              )}
            </div>
            {/* Sub */}
            <div className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              {team.logs} scouting logs · Ontario Provincial 2026
            </div>
          </div>
        </div>

        {/* Right: metric pills */}
        <div className="flex gap-[5px] flex-wrap items-center">
          {[
            { label: 'W–L', value: team.record, valColor: 'var(--text)' },
            { label: 'OPR', value: team.opr,    valColor: 'var(--text)' },
            { label: 'EPA', value: team.epa,     valColor: 'var(--text)' },
            { label: 'Climb', value: team.climb, valColor: climbColor(team.climb) },
          ].map(m => (
            <div
              key={m.label}
              className="flex items-center gap-[6px] font-mono"
              style={{
                padding: '3px 10px', borderRadius: 999,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                fontSize: 11,
              }}
            >
              <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                {m.label}
              </span>
              <span style={{ color: m.valColor, fontWeight: m.label === 'Climb' && team.climb !== 'L1' ? 600 : undefined }}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Snippet */}
      <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-soft)', lineHeight: 1.5, marginTop: 6 }}>
        {team.snippet}
      </div>

      {/* Buttons */}
      <div className="flex gap-[6px]" style={{ marginTop: 8 }}>
        <button
          className="font-mono transition-colors"
          style={{
            fontSize: 10, padding: '2px 9px', borderRadius: 999,
            background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          onClick={() => setExpanded(x => !x)}
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
        <button
          className="font-mono transition-colors"
          style={{
            fontSize: 10, padding: '2px 9px', borderRadius: 999,
            background: 'transparent', border: '1px solid var(--accent-border)', color: 'var(--accent)',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/teams/${team.number}`)}
        >
          View team →
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 10, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', padding: '12px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, fontFamily: 'var(--mono)', fontSize: 11 }}>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 8, opacity: 0.85 }}>Performance</div>
              {[['OPR', team.details.opr], ['EPA', team.details.epa], ['Avg fuel', team.details.avgFuel]].map(([l, v]) => (
                <div key={l} className="flex gap-2 mb-1" style={{ color: 'var(--text)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 44, flexShrink: 0 }}>{l}</span>{v}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 8, opacity: 0.85 }}>Record</div>
              {[['W–L', team.details.wl], ['RP', team.details.rp], ['Rank', team.details.rankOf]].map(([l, v]) => (
                <div key={l} className="flex gap-2 mb-1" style={{ color: 'var(--text)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 44, flexShrink: 0 }}>{l}</span>{v}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 8, opacity: 0.85 }}>Endgame</div>
              {[['Climb', team.details.climbLevel], ['Rate', team.details.climbRate]].map(([l, v]) => (
                <div key={l} className="flex gap-2 mb-1" style={{ color: 'var(--text)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 44, flexShrink: 0 }}>{l}</span>{v}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 8, opacity: 0.85 }}>Scouting</div>
              {[['Logs', team.details.logsCount], ['Coverage', team.details.coverage]].map(([l, v]) => (
                <div key={l} className="flex gap-2 mb-1" style={{ color: 'var(--text)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 44, flexShrink: 0 }}>{l}</span>{v}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TeamRow({ team, onClick }: { team: Team; onClick: () => void }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 32px 1fr 52px 64px 52px 44px 60px',
        gap: 12,
        padding: '9px 14px',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: team.isYou ? 'rgba(239,68,68,0.03)' : 'transparent',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { if (!team.isYou) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)' }}
      onMouseLeave={e => { if (!team.isYou) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {/* Rank */}
      <span className="font-mono" style={{ fontSize: 11, color: team.isYou ? 'var(--accent)' : 'var(--text-muted)' }}>
        #{team.rank}
      </span>

			{/* <TeamAvatar teamNumber={team.number} initials={team.initials} size={28} bg={team.avatarBg} border={team.avatarBorder} color={team.avatarColor} />*/}
			<TeamAvatar teamNumber={team.number} initials={team.initials} size={28} />

      {/* Identity */}
      <div className="flex items-baseline gap-[7px] min-w-0">
        <span
          className="font-mono font-bold flex-shrink-0"
          style={{ fontSize: 13, color: team.isYou ? 'var(--accent)' : 'var(--text)' }}
        >
          {team.number}
        </span>
        <span className="truncate" style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 400 }}>
          {team.name}
        </span>
        {team.isYou && (
          <span
            className="font-mono flex-shrink-0"
            style={{
              fontSize: 9, padding: '1px 6px', borderRadius: 999,
              background: 'rgba(239,68,68,0.12)', color: 'var(--accent)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            you
          </span>
        )}
      </div>

      {/* W–L */}
      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>{team.record}</span>

      {/* OPR */}
      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>{team.opr}</span>

      {/* EPA */}
      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>{team.epa}</span>

      {/* Climb */}
      <span className="font-mono" style={{ fontSize: 11, color: climbColor(team.climb) }}>{team.climb}</span>

      {/* View link */}
      <span
        className="font-mono"
        style={{ fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.12s', textAlign: 'right' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        onClick={e => { e.stopPropagation(); navigate(`/teams/${team.number}`) }}
      >
        View →
      </span>
    </div>
  )
}

export default function Teams() {
  const [activeSort, setActiveSort] = useState('Rank')
  const [view, setView] = useState<'card' | 'list'>('card')
  const navigate = useNavigate()

  const { eventKey } = useEventStore()
  const { teamNumber: userTeamNumber } = useUserStore()
  const { data, loading, refetch } = useQuery(GET_ALL_TEAM_INFO, { variables: { eventKey }, skip: !eventKey })
  const [syncTeams, { loading: syncing }] = useMutation(SYNC_TEAMS)
  const teams: Team[] = (data?.getAllTeamInfo ?? []).map((t: any, i: number) => mapTeam(t, i, userTeamNumber))

  async function handleSync() {
    if (!eventKey) return
    await syncTeams({ variables: { eventKey } })
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
            Teams · 2026ontor
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Teams at Event
          </div>
        </div>

        <div className="flex gap-[6px] flex-wrap items-center">
          {/* Search */}
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

          {/* Sort pills */}
          {['Rank', 'OPR', 'EPA', 'Record'].map(label => (
            <button
              key={label}
              className="transition-colors"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '5px 13px',
                borderRadius: 999, border: '1px solid',
                fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeSort === label ? 'var(--accent-dim)' : 'transparent',
                borderColor: activeSort === label ? 'var(--accent-border)' : 'var(--border)',
                color: activeSort === label ? 'var(--accent)' : 'var(--text-soft)',
              }}
              onClick={() => setActiveSort(label)}
            >
              {label}
            </button>
          ))}

          {/* Sync */}
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '5px 13px',
              borderRadius: 999, border: '1px solid var(--border)',
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
              cursor: syncing ? 'default' : 'pointer',
              background: 'transparent', color: syncing ? 'var(--text-muted)' : 'var(--text-soft)',
              opacity: syncing ? 0.6 : 1,
            }}
          >
            {syncing ? '↻ Syncing…' : '↻ Sync'}
          </button>

          {/* Export */}
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '5px 13px',
              borderRadius: 999, border: '1px solid var(--accent)',
              fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', background: 'var(--accent)', color: '#fff',
            }}
          >
            ↑ Export
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
          {teams.map(team => (
            <TeamCard key={team.number} team={team} />
          ))}
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
              gridTemplateColumns: '24px 32px 1fr 52px 64px 52px 44px 60px',
              gap: 12,
              padding: '8px 14px',
              borderBottom: '1px solid var(--border)',
              fontSize: 9,
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              alignItems: 'center',
            }}
          >
            <span>#</span>
            <span></span>
            <span>Team</span>
            <span>W–L</span>
            <span>OPR</span>
            <span>EPA</span>
            <span>Climb</span>
            <span style={{ textAlign: 'right' }}></span>
          </div>

          {/* Rows */}
          <div>
            {teams.map((team, i) => (
              <div
                key={team.number}
                style={{ borderBottom: i === teams.length - 1 ? 'none' : undefined }}
              >
                <TeamRow team={team} onClick={() => navigate(`/teams/${team.number}`)} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="font-mono text-center"
            style={{ fontSize: 10, color: 'var(--text-muted)', padding: 10, borderTop: '1px solid var(--border)' }}
          >
            25 teams · Ontario Provincial 2026
          </div>
        </div>
      )}

    </div>
  )
}
