import { useUserStore, useEventStore } from '../../store/useStore'
// import { useEffect } from 'react'
import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'

 const GET_EVENT_STATS = gql`
    query GetEventStats($eventKey: String!, $teamNumber: Int) {
      getEventStats(eventKey: $eventKey, teamNumber: $teamNumber) {
        matchCount
        teamsWithReports
        teamsWithoutReports
        reportCount
        matchesPlayed
        nextMatchNumber
        nextMatchTime
      }
    }
  `
const GET_USER_INFO = gql`
query GetUserInfo($eventKey: String!, $userNumber: Int!) {
	userInfo(eventKey: $eventKey, userNumber: $userNumber) {
		rank
		wins
		losses
		rankingPoints
		opr
		ccwms
		nickname
	}
}
`

const GET_TEAM_UPCOMING_MATCHES = gql`
query GetTeamUpcomingMatches($eventKey: String!, $teamNumber: Int!) {
  getTeamUpcomingMatches(eventKey: $eventKey, teamNumber: $teamNumber, limit: 5) {
    matchNumber
    predictedTime
    userOnRed
    redAlliance { teamNumber }
    blueAlliance { teamNumber }
  }
}
`

const GET_NEXT_MATCH = gql`
query GetNextMatch($eventKey: String!, $teamNumber: Int!) {
  getNextMatch(eventKey: $eventKey, teamNumber: $teamNumber) {
    matchNumber
    predictedTime
    userOnRed
    redAllianceOPR
    blueAllianceOPR
    redAlliance { teamNumber nickname opr rank wins losses }
    blueAlliance { teamNumber nickname opr rank wins losses }
  }
}
`

const GET_TOP_RANKINGS=gql`
query GetTopRankings($eventKey: String!){
	getTopRankings(eventKey: $eventKey){
		rank
		rankingPoints
		teamNumber
		nickname
		ccwms
	}
}
`
export default function Dashboard() {
	// user (store)
	// rank
	// record
	// ranking points of it and all teams
	// scouting coverage (num of reports, num of matches so far)
	// next match 
	// OPR
	// top rankings so far, and RP and OPR for each
	// <img src={`http://localhost:4000/avatar/854`} className="w-5 h-5 rounded-xl" alt="Team Avatar" />
	
	const { teamNumber } = useUserStore()
	const { eventKey, eventName } = useEventStore()
  const { data: userInfoData, loading: userInfoLoading, error: userInfoError } = useQuery(GET_USER_INFO, {variables: {eventKey, userNumber: Number(teamNumber)}, skip: !eventKey ||!teamNumber,})
  const { data: topTeamInfo, loading: topTeamInfoLoading, error: topTeamInfoError } = useQuery(GET_TOP_RANKINGS, {variables: {eventKey}, skip: !eventKey})
	const { data: statsData } = useQuery(GET_EVENT_STATS, { variables: { eventKey, teamNumber: Number(teamNumber) }, skip: !eventKey, })
  const { data: nextMatchData } = useQuery(GET_NEXT_MATCH, { variables: { eventKey, teamNumber: Number(teamNumber) }, skip: !eventKey || !teamNumber })
  const { data: upcomingMatchesData } = useQuery(GET_TEAM_UPCOMING_MATCHES, { variables: { eventKey, teamNumber: Number(teamNumber) }, skip: !eventKey || !teamNumber })
	const percentCoverage: number=(parseInt(statsData?.getEventStats.reportCount))/(6*parseInt(statsData?.getEventStats.matchesPlayed)).toFixed(0);
  const nextMatch = nextMatchData?.getNextMatch
  const nextMatchMins = nextMatch?.predictedTime
    ? Math.round((new Date(nextMatch.predictedTime).getTime() - Date.now()) / 60000)
    : null
  const nextMatchTimeStr = nextMatchMins == null ? null : nextMatchMins <= 0 ? 'now' : nextMatchMins < 60 ? `~${nextMatchMins} min` : `~${Math.round(nextMatchMins / 60)} hr`
	// console.log(statsData);
	console.log(userInfoData);
	// console.log(topTeamInfo);
	return (
    <div style={{ padding: '24px' }}>
      <div className="flex flex-col gap-[14px]">
        {/* Status bar */}
        <div className="flex items-center gap-3 pb-[18px]" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: 'var(--text)' }}>Team {teamNumber} · {eventName} </span>
          <div className="flex gap-[6px] flex-1">
            <span className="font-mono text-[10px] px-[9px] py-[3px] rounded-full" style={{ border: '1px solid var(--border)', color: 'var(--text-soft)', background: 'var(--surface2)' }}>#{userInfoData?.userInfo.rank ?? '-'} Rank</span>
            <span className="font-mono text-[10px] px-[9px] py-[3px] rounded-full" style={{ border: '1px solid var(--border)', color: 'var(--text-soft)', background: 'var(--surface2)' }}>{userInfoData?.userInfo.wins ?? '-'} – {userInfoData?.userInfo.losses ?? '-'} Record</span>
            <span className="font-mono text-[10px] px-[9px] py-[3px] rounded-full" style={{ border: '1px solid var(--border)', color: 'var(--text-soft)', background: 'var(--surface2)' }}>{userInfoData?.userInfo.rankingPoints ?? '-'} RP</span>
            <span className="font-mono text-[10px] px-[9px] py-[3px] rounded-full" style={{ border: '1px solid rgba(239,68,68,0.25)', color: 'var(--accent)', background: 'rgba(239,68,68,0.08)' }}>{percentCoverage}% Coverage</span>
          </div>
          <div className="flex gap-2 items-center ml-auto">
            {nextMatch && (
              <div className="font-mono text-[10px] px-[10px] py-[4px] rounded-[6px] whitespace-nowrap" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.18)', color: '#4ade80' }}>
                <span className="text-[8px] uppercase tracking-[0.12em] mr-[2px]" style={{ opacity: 0.55 }}>Next</span>Q{nextMatch.matchNumber}{nextMatchTimeStr ? ` · ${nextMatchTimeStr}` : ''}
              </div>
            )}
            <div className="font-mono text-[10px] px-[10px] py-[4px] rounded-[6px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)' }}>Qual Round {statsData?.getEventStats.matchesPlayed ?? '-'}</div>
            <div className="inline-flex items-center gap-[6px] px-[13px] py-[5px] rounded-[7px] font-mono text-[10px]" style={{ border: '1px solid rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.08)', color: '#4ade80' }}>
              <span className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: '#4ade80' }}></span>
              Live
            </div>
          </div>
        </div>

        {/* Hero: Next Match */}
        <div className="flex flex-col gap-6 rounded-[12px] p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {!nextMatch ? (
            <div className="font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>No upcoming matches found.</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.13em] uppercase" style={{ color: 'var(--text-muted)' }}>Next Match</div>
                  <div className="font-mono text-[48px] font-bold leading-none" style={{ letterSpacing: '-0.04em', display: 'inline-block', background: 'linear-gradient(135deg,#991b1b 0%,#ef4444 55%,#fca5a5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Q{nextMatch.matchNumber}</div>
                  <div className="font-mono text-[12px] mt-[6px]" style={{ color: 'var(--text-muted)' }}>
                    {nextMatchTimeStr ? `${nextMatchTimeStr} · ` : ''}Qualification {nextMatch.matchNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] mb-[6px]" style={{ color: 'var(--text-muted)' }}>Est. Alliance OPR</div>
                  <div className="font-mono text-[15px] font-semibold">
                    <span style={{ color: '#fda4af' }}>{nextMatch.redAllianceOPR?.toFixed(1)}</span>
                    <span className="mx-2 font-light" style={{ color: 'var(--text-muted)' }}>vs</span>
                    <span style={{ color: '#93c5fd' }}>{nextMatch.blueAllianceOPR?.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1px 1fr' }}>
                {/* Red alliance */}
                <div className="flex flex-col gap-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] px-[10px] py-[4px] rounded-[4px] inline-block" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fda4af' }}>
                    Red Alliance{nextMatch.userOnRed ? ' — your team' : ''}
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    {nextMatch.redAlliance.map((t: any) => {
                      const isYou = t.teamNumber === Number(teamNumber)
                      return (
                        <div key={t.teamNumber} className="flex items-center gap-[10px]">
                          <span className="font-mono text-[12px] font-semibold px-[10px] py-[3px] rounded-[4px] min-w-[46px] text-center" style={{ background: isYou ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.12)', border: `1px solid ${isYou ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)'}`, color: '#fca5a5' }}>{t.teamNumber}</span>
                          <div>
                            <div className="text-[12px]" style={{ color: 'var(--text)' }}>{t.nickname ?? `Team ${t.teamNumber}`}</div>
                            <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {t.opr != null ? `OPR ${t.opr.toFixed(1)} · ` : ''}{t.rank != null ? `#${t.rank} · ` : ''}{t.wins ?? 0}W {t.losses ?? 0}L
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="font-mono text-[10px] flex justify-between items-center pt-[10px]" style={{ color: 'var(--text-soft)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Alliance OPR</span><span className="font-semibold" style={{ color: '#fda4af' }}>{nextMatch.redAllianceOPR?.toFixed(1)}</span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ background: 'var(--border)' }}></div>

                {/* Blue alliance */}
                <div className="flex flex-col gap-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] px-[10px] py-[4px] rounded-[4px] inline-block" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                    Blue Alliance{!nextMatch.userOnRed ? ' — your team' : ''}
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    {nextMatch.blueAlliance.map((t: any) => {
                      const isYou = t.teamNumber === Number(teamNumber)
                      return (
                        <div key={t.teamNumber} className="flex items-center gap-[10px]">
                          <span className="font-mono text-[12px] font-semibold px-[10px] py-[3px] rounded-[4px] min-w-[46px] text-center" style={{ background: isYou ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)', border: `1px solid ${isYou ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.2)'}`, color: '#93c5fd' }}>{t.teamNumber}</span>
                          <div>
                            <div className="text-[12px]" style={{ color: 'var(--text)' }}>{t.nickname ?? `Team ${t.teamNumber}`}</div>
                            <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {t.opr != null ? `OPR ${t.opr.toFixed(1)} · ` : ''}{t.rank != null ? `#${t.rank} · ` : ''}{t.wins ?? 0}W {t.losses ?? 0}L
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="font-mono text-[10px] flex justify-between items-center pt-[10px]" style={{ color: 'var(--text-soft)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Alliance OPR</span><span className="font-semibold" style={{ color: '#93c5fd' }}>{nextMatch.blueAllianceOPR?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats row: 4 chips */}
        <div className="grid grid-cols-4 gap-[10px]">
          <div className="flex flex-col gap-[5px] rounded-[10px] p-[14px_16px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Rank</div>
            <div className="font-mono text-[26px] font-bold leading-none" style={{ letterSpacing: '-0.03em', background: 'linear-gradient(135deg,#991b1b 0%,#ef4444 55%,#fca5a5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>#{userInfoData?.userInfo.rank ?? '-'}</div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--text-soft)' }}>of 25 teams</div>
          </div>
          <div className="flex flex-col gap-[5px] rounded-[10px] p-[14px_16px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>OPR</div>
            <div className="font-mono text-[26px] font-bold leading-none" style={{ letterSpacing: '-0.03em', color: 'var(--text)' }}>176.2</div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--text-soft)' }}>Auto 74.1 · Tele 54.6 · End 47.5</div>
          </div>
          <div className="flex flex-col gap-[5px] rounded-[10px] p-[14px_16px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Record</div>
            <div className="font-mono text-[26px] font-bold leading-none" style={{ letterSpacing: '-0.03em' }}>
              <span style={{ color: '#4ade80' }}>{userInfoData?.userInfo.wins ?? '-'}</span>
              <span className="font-light" style={{ fontSize: '16px', color: 'var(--text-muted)' }}> – </span>
              <span style={{ color: '#fb7185' }}>{userInfoData?.userInfo.losses ?? '-'}</span>
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--text-soft)' }}>{userInfoData?.userInfo.rankingPoints ?? '0'} · {(userInfoData?.userInfo.wins *100/(userInfoData?.userInfo.losses+userInfoData?.userInfo.wins)).toFixed(1) ?? '-'}% win rate</div>
          </div>
          <div className="flex flex-col gap-[5px] rounded-[10px] p-[14px_16px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Scout Coverage</div>
            <div className="font-mono text-[26px] font-bold leading-none" style={{ letterSpacing: '-0.03em', color: 'var(--text)' }}>
							{percentCoverage}<span className="font-normal" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>%</span>
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--text-soft)' }}>{statsData?.getEventStats.reportCount} / {6*parseInt(statsData?.getEventStats.matchesPlayed)} · {statsData?.getEventStats.teamsWithoutReports} unscouted teams</div>
          </div>
        </div>

        {/* Two-col: Rankings + right (Coverage + Record) */}
        <div className="grid gap-[14px] items-start" style={{ gridTemplateColumns: '1fr 1fr' }}>

          {/* Event Rankings */}
          <div className="flex flex-col gap-4 rounded-[12px] p-5 h-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-start gap-[10px]">
              <div>
                <div className="text-[16px] font-medium" style={{ letterSpacing: '-0.01em', color: 'var(--text)' }}>Event Rankings</div>
                <div className="text-[12px] mt-[3px]" style={{ color: 'var(--text-muted)' }}>CCWMS · scout coverage</div>
              </div>
            </div>
            <div className="flex flex-col">
              {(() => {
                const userNum = Number(teamNumber)
                const rankings = topTeamInfo?.getTopRankings ?? []
                const isInTop10 = rankings.some((t: any) => t.teamNumber === userNum)
                const userInfo = userInfoData?.userInfo

                return (
                  <>
                    {rankings.map((topTeam: any) => {
                      const isYou = topTeam.teamNumber === userNum
                      return (
                        <div
                          key={topTeam.rank}
                          className="flex items-center gap-[10px] py-[7px] font-mono"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            ...(isYou ? { background: 'rgba(239,68,68,0.05)', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, borderLeft: '2px solid var(--accent)' } : {}),
                          }}
                        >
                          <span className="text-[10px] text-right flex-shrink-0" style={{ width: 18, color: isYou ? 'var(--accent)' : 'var(--text-muted)' }}>{topTeam.rank}</span>
                          <span className="text-[11px] font-semibold flex-shrink-0" style={{ width: 36, color: isYou ? 'var(--accent)' : 'var(--text)' }}>{topTeam.teamNumber}</span>
                          <span className="flex-1 text-[10px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--text-soft)' }}>{topTeam.nickname}</span>
                          <span className="text-[11px] font-semibold text-right flex-shrink-0" style={{ width: 38, color: 'var(--text)' }}>{topTeam.ccwms?.toFixed(1)}</span>
                          {isYou && <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }}></div>}
                        </div>
                      )
                    })}

                    {!isInTop10 && userInfo && (
                      <>
                        <div className="py-[4px] font-mono text-[9px] text-center" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>· · ·</div>
                        <div className="flex items-center gap-[10px] py-[7px] font-mono" style={{ background: 'rgba(239,68,68,0.05)', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, borderLeft: '2px solid var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span className="text-[10px] text-right flex-shrink-0" style={{ width: 18, color: 'var(--accent)' }}>{userInfo.rank}</span>
                          <span className="text-[11px] font-semibold flex-shrink-0" style={{ width: 36, color: 'var(--accent)' }}>{teamNumber}</span>
                          <span className="flex-1 text-[10px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--text-soft)' }}>{userInfo.nickname}</span>
                          <span className="text-[11px] font-semibold text-right flex-shrink-0" style={{ width: 38, color: 'var(--text)' }}>{userInfo.ccwms?.toFixed(1)}</span>
                          <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }}></div>
                        </div>
                      </>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-[14px]">

            {/* Scout Coverage card */}
            <div className="flex flex-col gap-4 rounded-[12px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-start gap-[10px]">
                <div>
                  <div className="text-[16px] font-medium" style={{ color: 'var(--text)' }}>Scout Coverage</div>
                  <div className="text-[12px] mt-[3px]" style={{ color: 'var(--text-muted)' }}>{statsData?.getEventStats.reportCount} observations</div>
                </div>
                <span className="font-mono text-[9px] px-2 py-[2px] rounded-full whitespace-nowrap" style={{ background: 'rgba(250,204,21,0.08)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}>behind pace</span>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-mono text-[32px] font-bold leading-none" style={{ letterSpacing: '-0.03em' }}>
									{percentCoverage}<span className="font-normal" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>%</span>
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{statsData?.getEventStats.reportCount} / {6*parseInt(statsData?.getEventStats.matchesPlayed)}</span>
                </div>
                <div className="h-[4px] rounded-[2px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-[2px]" style={{ background: 'var(--accent)', width: `${percentCoverage}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Unscouted', value: statsData?.getEventStats.teamsWithoutReports,  color: '#fb7185' },
                  { label: 'Full logs', value: statsData?.getEventStats.teamsWithReports,  color: 'var(--text)' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col gap-1 rounded-[7px] p-[9px_10px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    <div className="font-mono text-[14px] font-semibold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Record card */}
            <div className="flex flex-col gap-4 rounded-[12px] p-5 h-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-start gap-[10px]">
                <div>
                  <div className="text-[16px] font-medium" style={{ color: 'var(--text)' }}>Your Record</div>
                  <div className="text-[12px] mt-[3px]" style={{ color: 'var(--text-muted)' }}>All matches</div>
                </div>
                <div className="flex gap-[3px]">
                  {['#4ade80','#4ade80','#fb7185','#4ade80','#4ade80'].map((c, i) => (
                    <div key={i} className="w-[9px] h-[9px] rounded-[2px]" style={{ background: c, opacity: c === '#4ade80' ? 0.65 : 0.55 }}></div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-baseline gap-[5px]">
                  <span className="font-mono text-[44px] font-bold leading-none" style={{ color: '#4ade80', letterSpacing: '-0.04em' }}>{userInfoData?.userInfo.wins ?? '-'}</span>
                  <span className="font-mono text-[22px] font-light pb-[3px]" style={{ color: 'var(--text-muted)' }}>–</span>
                  <span className="font-mono text-[44px] font-bold leading-none" style={{ color: '#fb7185', letterSpacing: '-0.04em' }}>{userInfoData?.userInfo.losses ?? '-'}</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Ranking Pts', value: userInfoData?.userInfo.rankingPoints ?? '-' },
                    { label: 'CCWMS',         value: parseInt(userInfoData?.userInfo.ccwms).toFixed(1) ?? '-' },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col gap-1 rounded-[7px] p-[9px_10px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                      <div className="font-mono text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Matches card */}
        <div className="flex flex-col gap-4 rounded-[12px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-start gap-[10px]">
            <div>
              <div className="text-[16px] font-medium" style={{ color: 'var(--text)' }}>Upcoming Matches</div>
              <div className="text-[12px] mt-[3px]" style={{ color: 'var(--text-muted)' }}>
                {upcomingMatchesData?.getTeamUpcomingMatches?.length ?? 0} remaining
              </div>
            </div>
            <div className="flex gap-[7px] flex-wrap">
              {['◈ Pick Strategy', '✦ Alliance Builder', '↓ Export'].map(label => (
                <button key={label} className="inline-flex items-center gap-[5px] px-[13px] py-[6px] rounded-[7px] font-mono text-[11px] font-medium cursor-pointer" style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-soft)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            {(upcomingMatchesData?.getTeamUpcomingMatches ?? []).map((m: any, i: number) => {
              const isNext = i === 0
              const userNum = Number(teamNumber)
              const mins = m.predictedTime
                ? Math.round((new Date(m.predictedTime).getTime() - Date.now()) / 60000)
                : null
              const timeStr = mins == null ? 'Later' : mins <= 0 ? 'Now' : mins < 60 ? `~${mins} min` : `~${Math.round(mins / 60)} hr`

              return (
                <div
                  key={m.matchNumber}
                  className="flex items-center gap-3 py-[9px]"
                  style={{
                    borderBottom: i < (upcomingMatchesData.getTeamUpcomingMatches.length - 1) ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    ...(isNext ? { paddingLeft: 10, marginLeft: -2, borderLeft: '2px solid rgba(74,222,128,0.5)' } : {}),
                  }}
                >
                  <span className="font-mono text-[12px] font-semibold flex-shrink-0" style={{ color: isNext ? '#4ade80' : 'var(--text)', width: 36 }}>Q{m.matchNumber}</span>
                  <div className="flex-1 flex flex-col gap-[3px]">
                    <div className="flex gap-1">
                      {m.redAlliance.map((t: any) => {
                        const isYou = t.teamNumber === userNum
                        return (
                          <span key={t.teamNumber} className="font-mono text-[10px] px-[7px] py-[3px] rounded-[3px]" style={{ fontWeight: isYou ? 700 : 400, border: `1px solid ${isYou ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)'}`, background: isYou ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.12)', color: '#fca5a5' }}>{t.teamNumber}</span>
                        )
                      })}
                    </div>
                    <div className="flex gap-1">
                      {m.blueAlliance.map((t: any) => {
                        const isYou = t.teamNumber === userNum
                        return (
                          <span key={t.teamNumber} className="font-mono text-[10px] px-[7px] py-[3px] rounded-[3px]" style={{ fontWeight: isYou ? 700 : 400, border: `1px solid ${isYou ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.2)'}`, background: isYou ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)', color: '#93c5fd' }}>{t.teamNumber}</span>
                        )
                      })}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] flex-shrink-0" style={{ color: isNext ? '#4ade80' : 'var(--text-muted)' }}>{timeStr}</span>
                </div>
              )
            })}
            {!upcomingMatchesData?.getTeamUpcomingMatches?.length && (
              <div className="font-mono text-[11px] py-3" style={{ color: 'var(--text-muted)' }}>No upcoming matches.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
