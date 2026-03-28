import { useNavigate } from 'react-router-dom'

interface TeamRow {
  number: string
  name: string
  opr: string
  auto: string
  tele: string
  climb: string
  climbColor: string
  notes: string | null
}

const RED_TEAMS: TeamRow[] = [
  {
    number: '1114',
    name: 'Simbotics',
    opr: '247.3',
    auto: '14 fuel',
    tele: '11 / 0',
    climb: 'L3 ✓',
    climbColor: 'var(--green)',
    notes: 'Fast ground intake, scored 14 fuel in auto. Consistent L3 climb with backup L2.',
  },
  {
    number: '854',
    name: 'Ti-84s',
    opr: '148.3',
    auto: '7 fuel',
    tele: '8 / 1',
    climb: 'L1',
    climbColor: 'var(--text-muted)',
    notes: 'Played defense second half of teleop. Occasional fuel misses near goal.',
  },
  {
    number: '5031',
    name: 'Patriots',
    opr: '159.1',
    auto: '8 fuel',
    tele: '9 / 0',
    climb: 'L1',
    climbColor: 'var(--text-muted)',
    notes: 'Clean teleop run, no penalties. Low climb but solid scorer.',
  },
]

const BLUE_TEAMS: TeamRow[] = [
  {
    number: '2056',
    name: 'OP Robotics',
    opr: '231.8',
    auto: '10 fuel',
    tele: '9 / 2',
    climb: 'L3 ✓',
    climbColor: 'var(--green)',
    notes: 'Below avg auto today — only 10 fuel vs usual 13+. Still completed L3 climb.',
  },
  {
    number: '771',
    name: 'SWAT',
    opr: '163.9',
    auto: '7 fuel',
    tele: '8 / 1',
    climb: 'L2',
    climbColor: 'var(--c-amber)',
    notes: 'Tried to defend 1114 with limited success. L2 climb completed.',
  },
  {
    number: '9262',
    name: 'Quantum',
    opr: '141.7',
    auto: '5 fuel',
    tele: '6 / 0',
    climb: 'L1',
    climbColor: 'var(--text-muted)',
    notes: null,
  },
]

const SCOUTS = [
  { robot: 'R1 · 1114', scout: 'Alex M.' },
  { robot: 'R2 · 854',  scout: 'Jordan K.' },
  { robot: 'R3 · 5031', scout: 'Sam T.' },
  { robot: 'B1 · 2056', scout: 'Riley P.' },
  { robot: 'B2 · 771',  scout: 'Morgan C.' },
  { robot: 'B3 · 9262', scout: 'Drew L.' },
]

function AllianceCard({
  alliance,
  teams,
  score,
  won,
}: {
  alliance: 'red' | 'blue'
  teams: TeamRow[]
  score: string
  won: boolean
}) {
  const isRed = alliance === 'red'
  const headerColor = isRed ? '#fda4af' : '#93c5fd'
  const chipBg = isRed ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)'
  const chipBorder = isRed ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'
  const chipColor = isRed ? '#fca5a5' : '#93c5fd'
  const headerBg = isRed ? 'rgba(239,68,68,0.04)' : 'rgba(59,130,246,0.04)'
  const cardBorder = isRed
    ? won ? 'rgba(239,68,68,0.3)' : 'var(--border)'
    : won ? 'rgba(59,130,246,0.3)' : 'var(--border)'

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ background: 'var(--surface)', border: `1px solid ${cardBorder}` }}>
      {/* Alliance header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: headerBg, borderBottom: '1px solid var(--border)' }}>
        <div className="font-mono text-[11px] font-semibold" style={{ color: headerColor }}>
          {isRed ? 'Red Alliance' : 'Blue Alliance'}
          {won && <span className="ml-2 text-[9px] uppercase tracking-[0.1em] opacity-70">Winner</span>}
        </div>
        <div className="font-mono text-[18px] font-bold" style={{ color: headerColor }}>{score}</div>
      </div>

      {/* Team rows */}
      {teams.map((t, i) => (
        <div
          key={t.number}
          className="flex flex-col gap-2 px-4 py-3"
          style={i < teams.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[12px] font-semibold px-[8px] py-[2px] rounded-[4px] cursor-pointer"
              style={{ background: chipBg, border: `1px solid ${chipBorder}`, color: chipColor }}
            >
              {t.number}
            </span>
            <span className="text-[12px]" style={{ color: 'var(--text-soft)' }}>{t.name}</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'OPR',   value: t.opr },
              { label: 'Auto',  value: t.auto },
              { label: 'Tele',  value: t.tele },
              { label: 'Climb', value: t.climb, color: t.climbColor },
            ].map(m => (
              <div key={m.label} className="flex flex-col gap-[2px]">
                <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                <div className="font-mono text-[11px] font-semibold" style={{ color: m.color ?? 'var(--text)' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div className="font-mono text-[11px] italic" style={{ color: t.notes ? 'var(--text-soft)' : 'var(--text-muted)' }}>
            {t.notes ?? 'No scouting notes'}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MatchDetail() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '24px' }}>
      <div className="flex flex-col gap-5">

        {/* Back button + header */}
        <div className="flex flex-col gap-3">
          <button
            className="font-mono text-[11px] w-fit px-3 py-[5px] rounded-[6px] cursor-pointer"
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-soft)' }}
            onClick={() => navigate('/matches')}
          >
            ← Matches
          </button>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.13em] mb-1" style={{ color: 'var(--text-muted)' }}>Qual 1 · Ontario Provincial 2026</div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[22px] font-semibold" style={{ letterSpacing: '-0.02em', color: 'var(--text)' }}>Qualification Match 1</h1>
              <span className="font-mono text-[9px] px-[8px] py-[3px] rounded-full" style={{ background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)' }}>● scouted</span>
              <button
                className="font-mono text-[10px] px-[10px] py-[4px] rounded-[6px] cursor-pointer ml-auto"
                style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-soft)' }}
              >
                ↑ Export
              </button>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-[3px] px-4 py-[10px] rounded-[8px]" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Red Score</div>
            <div className="font-mono text-[20px] font-bold" style={{ color: '#fda4af' }}>148</div>
          </div>
          <div className="flex flex-col gap-[3px] px-4 py-[10px] rounded-[8px]" style={{ border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.05)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Blue Score</div>
            <div className="font-mono text-[20px] font-bold" style={{ color: '#93c5fd' }}>121</div>
          </div>
          <div className="flex flex-col gap-[3px] px-4 py-[10px] rounded-[8px]" style={{ border: '1px solid var(--border)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Winner</div>
            <div className="font-mono text-[20px] font-bold" style={{ color: '#fda4af' }}>Red Alliance</div>
          </div>
          <div className="flex flex-col gap-[3px] px-4 py-[10px] rounded-[8px]" style={{ border: '1px solid var(--border)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Margin</div>
            <div className="font-mono text-[20px] font-bold" style={{ color: 'var(--text)' }}>+27</div>
          </div>
          <div className="flex flex-col gap-[3px] px-4 py-[10px] rounded-[8px]" style={{ border: '1px solid var(--border)' }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Scout Coverage</div>
            <div className="font-mono text-[20px] font-bold" style={{ color: 'var(--green)' }}>6/6</div>
          </div>
        </div>

        {/* Alliance breakdowns */}
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <AllianceCard alliance="red" teams={RED_TEAMS} score="148" won={true} />
          <AllianceCard alliance="blue" teams={BLUE_TEAMS} score="121" won={false} />
        </div>

        {/* Scout coverage section */}
        <div className="flex flex-col gap-4 rounded-[12px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>Scouting coverage</div>
              <div className="font-mono text-[10px] mt-[3px]" style={{ color: 'var(--text-muted)' }}>All 6 robots scouted</div>
            </div>
            <div className="flex gap-[5px]">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="w-[8px] h-[8px] rounded-full" style={{ background: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)' }}></div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SCOUTS.map(s => (
              <div key={s.robot} className="flex flex-col gap-[3px] px-3 py-2 rounded-[7px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{s.robot}</div>
                <div className="font-mono text-[11px] font-medium" style={{ color: 'var(--text-soft)' }}>{s.scout}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
