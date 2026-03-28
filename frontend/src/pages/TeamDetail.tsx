import { useNavigate, useParams } from 'react-router-dom'
import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { useEventStore } from '../../store/useStore'

const GET_TEAM = gql`
query GetTeam($eventKey: String!, $userNumber: Int!) {
  userInfo(eventKey: $eventKey, userNumber: $userNumber) {
    teamNumber
    nickname
    rank
    wins
    losses
    ties
    opr
    dpr
    ccwms
    rankingPoints
    rankingScore
    avgPoints
    calculatedEPA
    endgameReliability
    totalClimbL1
    totalClimbL2
    totalClimbL3
    totalClimbFail
    scoutingDataCount
  }
}
`

const GET_TEAM_MATCHES = gql`
query GetTeamMatches($eventKey: String!, $teamNumber: Int!) {
  getTeamMatches(eventKey: $eventKey, teamNumber: $teamNumber) {
    matchNumber
    matchKey
    status
    redScore
    blueScore
    redAlliance { teamNumber }
    blueAlliance { teamNumber }
  }
}
`

const GET_SCOUTING = gql`
query GetTeamScouting($eventKey: String!, $teamNumber: Int!) {
  getTeamScoutingData(eventKey: $eventKey, teamNumber: $teamNumber) {
    id
    matchNumber
    scoutName
    autoFuel
    teleopFuel
    missed
    climbLevel
    autoClimb
    penalties
    totalPoints
    notes
    autoNotes
  }
}
`

function MatchAvatar({ teamNumber: num, isYou, cardBg, index, total }: { teamNumber: number; isYou?: boolean; cardBg: string; index: number; total: number }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div
      title={String(num)}
      style={{
        width: 22, height: 22, borderRadius: '50%',
        marginLeft: index === 0 ? 0 : -7,
        zIndex: total - index,
        border: `2px solid ${cardBg}`,
        background: isYou ? 'var(--accent-dim)' : 'var(--surface3)',
        color: isYou ? 'var(--accent)' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 7, fontWeight: 600,
        flexShrink: 0, position: 'relative', overflow: 'hidden',
      }}
    >
      {!imgError
        ? <img src={`http://localhost:4000/avatar/${num}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" onError={() => setImgError(true)} />
        : String(num).slice(0, 2)
      }
    </div>
  )
}

function AvatarStack({ teams, cardBg, focusTeam }: { teams: { number: string; isYou?: boolean }[]; cardBg: string; focusTeam?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {teams.map((t, i) => (
        <MatchAvatar key={t.number} teamNumber={Number(t.number)} isYou={t.isYou || Number(t.number) === focusTeam} cardBg={cardBg} index={i} total={teams.length} />
      ))}
    </div>
  )
}

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

function climbColor(level: string | null) {
  if (level === 'level3') return '#4ade80'
  if (level === 'level2') return 'var(--c-amber)'
  if (level === 'level1') return 'var(--text-soft)'
  return 'var(--text-muted)'
}

export default function TeamDetail() {
  const navigate = useNavigate()
  const { teamNumber: teamNumberParam } = useParams<{ teamNumber: string }>()
  const { eventKey, eventName } = useEventStore()
  const teamNumber = Number(teamNumberParam)
  const [expandedReport, setExpandedReport] = useState<number | null>(null)

  const { data: teamData, loading: teamLoading } = useQuery(GET_TEAM, {
    variables: { eventKey, userNumber: teamNumber },
    skip: !eventKey || !teamNumber,
  })

  const { data: matchesData } = useQuery(GET_TEAM_MATCHES, {
    variables: { eventKey, teamNumber },
    skip: !eventKey || !teamNumber,
  })

  const { data: scoutingData, loading: scoutingLoading } = useQuery(GET_SCOUTING, {
    variables: { eventKey, teamNumber },
    skip: !eventKey || !teamNumber,
  })

  const team = teamData?.userInfo
  const reports = scoutingData?.getTeamScoutingData ?? []
  const matches = matchesData?.getTeamMatches ?? []

  const totalClimbs = (team?.totalClimbL1 ?? 0) + (team?.totalClimbL2 ?? 0) + (team?.totalClimbL3 ?? 0) + (team?.totalClimbFail ?? 0)
  const climbRate = totalClimbs > 0 ? Math.round(((team?.totalClimbL1 ?? 0) + (team?.totalClimbL2 ?? 0) + (team?.totalClimbL3 ?? 0)) / totalClimbs * 100) : 0
  const bestClimb = (team?.totalClimbL3 ?? 0) > 0 ? 'L3' : (team?.totalClimbL2 ?? 0) > 0 ? 'L2' : (team?.totalClimbL1 ?? 0) > 0 ? 'L1' : '—'

  const stats = team ? [
    { label: 'Rank',    value: team.rank != null ? `#${team.rank}` : '—',          accent: true  },
    { label: 'OPR',     value: team.opr != null ? team.opr.toFixed(1) : '—',       accent: true  },
    { label: 'EPA',     value: team.calculatedEPA != null ? String(Math.round(team.calculatedEPA)) : '—' },
    { label: 'W–L',     value: `${team.wins ?? 0}–${team.losses ?? 0}` },
    { label: 'RP',      value: String(team.rankingPoints ?? 0) },
    { label: 'Climb',   value: bestClimb, green: bestClimb !== '—' },
    { label: 'Climb %', value: `${climbRate}%` },
    { label: 'Scouted', value: `${team.scoutingDataCount ?? 0} logs` },
  ] : []

  if (teamLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="flex flex-col gap-5">

        {/* Back + header */}
        <div className="flex flex-col gap-3">
          <button
            className="font-mono text-[11px] w-fit px-3 py-[5px] rounded-[6px] cursor-pointer"
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-soft)' }}
            onClick={() => navigate('/teams')}
          >
            ← Teams
          </button>

          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-[10px] flex items-center justify-center font-mono text-[14px] font-semibold flex-shrink-0 overflow-hidden relative"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <img
                src={`http://localhost:4000/avatar/${teamNumber}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                alt=""
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            </div>

            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.13em] mb-1" style={{ color: 'var(--text-muted)' }}>
                Team {teamNumber} · {eventName}
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-semibold" style={{ letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  {team?.nickname ?? `Team ${teamNumber}`}
                </h1>
                <div className="flex gap-2 ml-auto">
                  <button
                    className="font-mono text-[10px] px-[10px] py-[4px] rounded-[6px] cursor-pointer"
                    style={{ background: 'var(--accent)', border: '1px solid var(--accent)', color: '#fff' }}
                  >
                    + Scout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        {team && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stats.map(s => (
              <div
                key={s.label}
                className="flex flex-col gap-[2px] px-[14px] py-2 rounded-[8px] flex-shrink-0"
                style={
                  s.accent ? { background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' } :
                  s.green  ? { background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' } :
                             { border: '1px solid var(--border)' }
                }
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                <div className="font-mono text-[14px] font-semibold" style={{ color: s.accent ? 'var(--accent)' : s.green ? '#4ade80' : 'var(--text)' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Two-col layout */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 300px' }}>

          {/* Match history */}
          <div className="flex flex-col gap-3 rounded-[12px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>Match History</div>
            {matches.length === 0 && (
              <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>No matches played yet.</div>
            )}
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {matches.map((m: any, idx: number) => {
                const { id } = parseMatchKey(m.matchKey ?? '')
                const onRed = m.redAlliance.some((t: any) => t.teamNumber === teamNumber)
                const hasScore = m.redScore != null && m.blueScore != null && m.redScore >= 0 && m.blueScore >= 0
                const isCompleted = m.status === 'completed'
                const redWon = hasScore && isCompleted && m.redScore > m.blueScore
                const blueWon = hasScore && isCompleted && m.blueScore > m.redScore
                const winner = redWon ? 'red' : blueWon ? 'blue' : null
                const userWon  = winner !== null && (onRed ? winner === 'red' : winner === 'blue')
                const userLost = isCompleted && winner !== null && !userWon
                const cardBg = 'var(--surface2)'
                const red = m.redAlliance.map((t: any) => ({ number: String(t.teamNumber), isYou: t.teamNumber === teamNumber }))
                const blue = m.blueAlliance.map((t: any) => ({ number: String(t.teamNumber), isYou: t.teamNumber === teamNumber }))
                return (
                  <div
                    key={m.matchNumber}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr 36px auto',
                      gap: 10,
                      padding: '9px 12px',
                      alignItems: 'center',
                      background: cardBg,
                      borderBottom: idx < matches.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {/* Match ID */}
                    <span className="font-mono font-bold" style={{ fontSize: 12, color: 'var(--text)' }}>{id}</span>

                    {/* Teams */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AvatarStack teams={red} cardBg={cardBg} focusTeam={teamNumber} />
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {red.map((t: any) => (
                            <span key={t.number} className="font-mono" style={{ fontSize: 10, color: t.isYou ? 'var(--accent)' : 'var(--text-soft)', fontWeight: t.isYou ? 700 : 400 }}>{t.number}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AvatarStack teams={blue} cardBg={cardBg} focusTeam={teamNumber} />
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {blue.map((t: any) => (
                            <span key={t.number} className="font-mono" style={{ fontSize: 10, color: t.isYou ? 'var(--accent)' : 'var(--text-soft)', fontWeight: t.isYou ? 700 : 400 }}>{t.number}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="font-mono" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, textAlign: 'right' }}>
                      {hasScore ? (
                        <>
                          <span style={{ color: redWon ? 'var(--text)' : 'var(--text-muted)', fontWeight: redWon ? 700 : 400 }}>{m.redScore}</span>
                          <span style={{ color: blueWon ? 'var(--text)' : 'var(--text-muted)', fontWeight: blueWon ? 700 : 400 }}>{m.blueScore}</span>
                        </>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </div>

                    {/* Result badge */}
                    <span style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 20, fontFamily: 'var(--mono)',
                      display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
                      ...(userWon
                        ? { background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)' }
                        : userLost
                        ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fb7185' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                      ),
                    }}>
                      {!isCompleted ? 'upcoming' : userWon ? 'win' : userLost ? 'loss' : 'tie'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scouting reports */}
          <div className="flex flex-col gap-3 rounded-[12px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>Scouting Reports</div>
              <span className="font-mono text-[9px] px-[8px] py-[2px] rounded-full" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {reports.length} logs
              </span>
            </div>

            {scoutingLoading && <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>}
            {!scoutingLoading && reports.length === 0 && (
              <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>No scouting reports yet.</div>
            )}

            <div className="flex flex-col gap-2">
              {reports.map((r: any) => {
                const expanded = expandedReport === r.id
                return (
                  <div
                    key={r.id}
                    className="flex flex-col gap-2 rounded-[8px] p-3 cursor-pointer"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                    onClick={() => setExpandedReport(expanded ? null : r.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold" style={{ color: 'var(--text)' }}>Q{r.matchNumber}</span>
                      <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>{r.scoutName ?? 'Unknown scout'}</span>
                      {r.climbLevel && r.climbLevel !== 'none' && (
                        <span className="ml-auto font-mono text-[9px] px-[7px] py-[2px] rounded-[4px]" style={{ border: '1px solid', borderColor: climbColor(r.climbLevel), color: climbColor(r.climbLevel), opacity: 0.85 }}>
                          {r.climbLevel === 'level3' ? 'L3' : r.climbLevel === 'level2' ? 'L2' : 'L1'}
                        </span>
                      )}
                      {r.totalPoints != null && (
                        <span className="font-mono text-[9px] px-[7px] py-[2px] rounded-[4px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-soft)' }}>
                          {r.totalPoints} pts
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4">
                      {[
                        { label: 'Auto',   value: r.autoFuel   != null ? String(r.autoFuel)   : '—' },
                        { label: 'Tele',   value: r.teleopFuel != null ? String(r.teleopFuel) : '—' },
                        { label: 'Missed', value: r.missed     != null ? String(r.missed)     : '—' },
                      ].map(m => (
                        <div key={m.label} className="flex flex-col gap-[2px]">
                          <div className="font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                          <div className="font-mono text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                    {expanded && (r.notes || r.autoNotes) && (
                      <div className="flex flex-col gap-1 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                        {r.autoNotes && <div className="font-mono text-[10px] italic" style={{ color: 'var(--text-soft)' }}>Auto: {r.autoNotes}</div>}
                        {r.notes     && <div className="font-mono text-[10px] italic" style={{ color: 'var(--text-soft)' }}>{r.notes}</div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
