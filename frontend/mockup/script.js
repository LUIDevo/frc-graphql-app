  // ═══════════════ Teams: View Toggle ═══════════════
  function setTeamView(view) {
    const cards   = document.getElementById('team-card-list');
    const compact = document.getElementById('team-compact-list');
    const btnCard    = document.getElementById('view-card-btn');
    const btnCompact = document.getElementById('view-compact-btn');
    if (view === 'compact') {
      cards.classList.add('hidden');
      compact.classList.add('active');
      btnCard.classList.remove('active');
      btnCompact.classList.add('active');
    } else {
      cards.classList.remove('hidden');
      compact.classList.remove('active');
      btnCard.classList.add('active');
      btnCompact.classList.remove('active');
    }
  }

  // ═══════════════ Theme ═══════════════
  let darkMode = false;

  function applyTheme(pageId) {
    const lightPages = ['dashboard', 'teams', 'matches', 'settings', 'alliance', 'pickstrat'];
    const isLight = lightPages.includes(pageId);
    document.body.classList.toggle('dashboard-light', isLight);
    document.body.classList.toggle('dashboard-dark', isLight && darkMode);
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = darkMode ? '☀' : '◑';
  }

  function toggleTheme() {
    darkMode = !darkMode;
    const active = document.querySelector('.nav-item.active');
    const pageId = active ? active.getAttribute('data-page') : 'dashboard';
    applyTheme(pageId);
  }

  // ═══════════════ Page Navigation ═══════════════
  function show(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');
    const nav = document.querySelector('.nav-item[data-page="' + pageId + '"]');
    if (nav) nav.classList.add('active');
    applyTheme(pageId);
  }

  // ═══════════════ Settings: Reveal key ═══════════════
  function toggleKey(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = 'Hide';
    } else {
      input.type = 'password';
      btn.textContent = 'Reveal';
    }
  }

  // ═══════════════ Chip toggles ═══════════════
  function toggleChipGroup(el) {
    const group = el.closest('.chip-group');
    group.querySelectorAll('.chip-opt').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  // Filter chip groups (teams/matches pages)
  function setFilterChip(el) {
    const bar = el.closest('.filter-bar');
    bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  // ═══════════════ Pick Strategy — data ═══════════════
  const pickTeams = [
    { num: '4069', name: 'WARHawks',         opr: 184.7, epa: 151, climb: 'L2', fuel: 9.1,  wlt: '7-3', decline: 'low',
      matchScores: [182,195,178,190,186,192,180,188,191,184], defaultTags: ['reliable climb','good comms'], defaultNote: 'Consistent L2 every match. Clean driver.' },
    { num: '771',  name: 'SWAT',             opr: 163.9, epa: 138, climb: 'L2', fuel: 7.9,  wlt: '6-4', decline: 'low',
      matchScores: [155,178,142,171,168,155,180,162,165,172], defaultTags: ['field presence'], defaultNote: 'Variable output. Strong matches 2, 7. Auto inconsistency in match 3.' },
    { num: '5031', name: 'Patriots',         opr: 159.1, epa: 130, climb: 'L1', fuel: 7.4,  wlt: '6-4', decline: 'low',
      matchScores: [158,161,155,163,159,157,162,156,160,164], defaultTags: ['reliable climb'], defaultNote: 'Very consistent L1. Not flashy but dependable.' },
    { num: '854',  name: 'Ti-84s',           opr: 148.3, epa: 122, climb: 'L1', fuel: 6.8,  wlt: '5-5', decline: 'medium',
      matchScores: [145,160,138,152,148,144,158,142,150,155], defaultTags: ['mech issues'], defaultNote: 'Had a chain slip match 5. Fixed for match 6 onward. Watch endgame.' },
    { num: '9262', name: 'Quantum',          opr: 141.7, epa: 114, climb: 'none', fuel: 5.9, wlt: '5-5', decline: 'low',
      matchScores: [138,150,135,145,142,138,148,140,143,147], defaultTags: ['fast cycle'], defaultNote: 'No endgame but very fast cycle. Could complement a climb-heavy alliance.' },
    { num: '7558', name: 'Circuit Breakers', opr: 138.2, epa: 109, climb: 'L2', fuel: 6.1,  wlt: '5-5', decline: 'low',
      matchScores: [128,148,122,142,138,130,145,135,140,143], defaultTags: [], defaultNote: '' },
    { num: '3284', name: 'Caledonia',        opr: 132.4, epa: 101, climb: 'L1', fuel: 5.7,  wlt: '4-6', decline: 'low',
      matchScores: [130,138,125,135,133,128,138,130,134,136], defaultTags: [], defaultNote: '' },
    { num: '5678', name: 'Iron Wolves',      opr: 127.9, epa:  96, climb: 'none', fuel: 5.1, wlt: '4-6', decline: 'medium',
      matchScores: [118,140,110,132,128,122,138,125,129,133], defaultTags: ['risky'], defaultNote: 'Inconsistent. Big variance match to match.' },
    { num: '8821', name: 'Trident',          opr: 121.3, epa:  88, climb: 'L1', fuel: 4.8,  wlt: '3-7', decline: 'high',
      matchScores: [119,125,118,122,121,118,124,120,122,123], defaultTags: ['reliable climb'], defaultNote: 'Consistent but low scoring. May decline — heard they prefer A3.' },
    { num: '2481', name: 'Roboteers',        opr: 118.6, epa:  84, climb: 'L2', fuel: 4.5,  wlt: '3-7', decline: 'low',
      matchScores: [115,122,112,120,118,114,122,116,120,122], defaultTags: [], defaultNote: '' },
    { num: '4321', name: 'Nova Squad',       opr: 112.1, epa:  78, climb: 'L1', fuel: 4.1,  wlt: '3-7', decline: 'low',
      matchScores: [109,116,108,114,112,109,115,111,113,116], defaultTags: [], defaultNote: '' },
    { num: '6103', name: 'Electron',         opr: 108.4, epa:  72, climb: 'L3', fuel: 3.9,  wlt: '2-8', decline: 'low',
      matchScores: [100,118,95,112,108,102,116,105,110,114], defaultTags: ['strong auto','risky'], defaultNote: 'L3 climb but low overall OPR. Good auto. Worth watching if you need climb insurance.' },
    { num: '6632', name: 'Astro Falcons',    opr: 176.2, epa: 144, climb: 'L3', fuel: 8.6,  wlt: '7-3', you: true },
  ];

  const MY_TEAM = pickTeams.find(t => t.you);
  const POOL    = pickTeams.filter(t => !t.you);

  // ── State ──
  let currentRole  = 'scorer';
  let expandedTeam = null;
  const watchState    = {};              // num -> 'watch' | 'avoid'
  const goneTeams     = new Set();       // confirmed taken by another alliance
  const declineMarked = new Set();       // teams user marked as "will decline my pick"
  const myAlliance    = [];              // up to 2 team nums
  const teamNotes     = {};             // num -> { tags: Set, text: string }
  const predictedPicks = { A1: null, A2: null, A3: null, A4: null };


  const CLIMB_CLS = { L3: 'climb-l3', L2: 'climb-l2', L1: 'climb-l1', none: 'climb-none' };
  const AV_STYLES = [
    'background:rgba(59,130,246,0.15);color:#93c5fd;border-color:rgba(59,130,246,0.2)',
    'background:rgba(168,85,247,0.15);color:#c4b5fd;border-color:rgba(168,85,247,0.2)',
    'background:rgba(34,211,238,0.15);color:#22d3ee;border-color:rgba(34,211,238,0.2)',
    'background:rgba(250,204,21,0.12);color:#facc15;border-color:rgba(250,204,21,0.2)',
    'background:rgba(244,63,94,0.12);color:#fda4af;border-color:rgba(244,63,94,0.2)',
    'background:rgba(20,184,166,0.15);color:#5eead4;border-color:rgba(20,184,166,0.2)',
  ];

  // ── Helpers ──
  function climbScore(c)  { return c === 'L3' ? 40 : c === 'L2' ? 25 : c === 'L1' ? 10 : 0; }

  function fitScore(t, role) {
    if (role === 'scorer')   return (t.opr * 0.55) + (t.epa * 0.20) + climbScore(t.climb) * 0.35;
    if (role === 'climber')  return climbScore(t.climb) * 3.5 + (t.opr * 0.07);
    if (role === 'defender') return 75 + climbScore(t.climb) * 0.4 - (t.opr * 0.04);
    return (t.opr * 0.32) + (t.epa * 0.15) + climbScore(t.climb) * 1.4 + (t.fuel * 1.2);
  }

  function stdDev(scores) {
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    return Math.sqrt(scores.reduce((s, v) => s + (v - avg) ** 2, 0) / scores.length);
  }

  function reliability(t) {
    if (!t.matchScores || t.matchScores.length < 3) return 75;
    return Math.round(Math.max(10, Math.min(99, 100 - (stdDev(t.matchScores) / t.opr) * 100)));
  }

  function trend(t) {
    if (!t.matchScores || t.matchScores.length < 6) return null;
    const n = t.matchScores.length;
    const recent = t.matchScores.slice(-3).reduce((s, v) => s + v, 0) / 3;
    const early  = t.matchScores.slice(0, 3).reduce((s, v) => s + v, 0) / 3;
    const delta  = (recent - early) / early;
    if (delta >  0.12) return 'up';
    if (delta < -0.12) return 'down';
    return null;
  }

  function availability(t, rank, total) {
    // P(at least one of 4 alliances before you wants this team)
    const desirability = Math.max(0.03, 1 - (rank / Math.max(total, 1)));
    const pGone = 1 - Math.pow(1 - desirability * 0.55, 4);
    let pAvail = 1 - pGone;
    if (declineMarked.has(t.num)) pAvail = Math.min(0.97, pAvail + 0.25); // decline = more available to you
    return Math.max(0.03, Math.min(0.97, pAvail));
  }

  function getTeamNotes(num) {
    if (!teamNotes[num]) {
      const t = pickTeams.find(x => x.num === num);
      teamNotes[num] = { text: t?.defaultNote || '' };
    }
    return teamNotes[num];
  }

  // ── Main render ──
  function renderPickPool() {
    const tbody = document.getElementById('pick-pool-tbody');
    document.getElementById('role-label').textContent = currentRole;
    const search = (document.getElementById('pick-search')?.value || '').toLowerCase();

    // Predicted picks set
    const predSet = new Set(Object.values(predictedPicks).filter(Boolean));

    // Available (not gone, not you)
    const avail = POOL.filter(t =>
      !goneTeams.has(t.num) &&
      (!search || t.num.includes(search) || t.name.toLowerCase().includes(search))
    );
    // Separate predicted-gone from real pool for ranking
    const truePool = avail.filter(t => !predSet.has(t.num));
    const predGone = avail.filter(t => predSet.has(t.num));

    const sorted = [...truePool].sort((a, b) => fitScore(b, currentRole) - fitScore(a, currentRole));
    const allSorted = [...sorted, ...predGone];
    const maxF = sorted.length > 0 ? Math.max(...sorted.map(t => fitScore(t, currentRole))) : 1;

    tbody.innerHTML = '';
    allSorted.forEach((t, i) => {
      const isPredGone = predSet.has(t.num);
      const rank       = isPredGone ? null : sorted.indexOf(t) + 1;
      const fs         = fitScore(t, currentRole);
      const pct        = maxF > 0 ? (fs / maxF) * 100 : 0;
      const ws         = watchState[t.num] || null;
      const inA        = myAlliance.includes(t.num);
      const rely       = reliability(t);
      const avail_pct  = availability(t, isPredGone ? 9 : rank - 1, sorted.length);
      const tr_val     = trend(t);
      const isExpanded = expandedTeam === t.num;
      const cl         = t.climb === 'none' ? '—' : t.climb;
      const avStyle    = AV_STYLES[i % AV_STYLES.length];
      const avLabel    = t.num.slice(0, 2);

      // Rely bar color
      const relyColor = rely >= 80 ? '#22d3ee' : rely >= 60 ? '#facc15' : '#fb7185';
      // Avail color class
      const availCls  = avail_pct >= 0.55 ? 'avail-hi' : avail_pct >= 0.3 ? 'avail-md' : 'avail-lo';

      // Decline dot
      const declineCls = declineMarked.has(t.num) ? 'decline-hi' : t.decline === 'high' ? 'decline-hi' : t.decline === 'medium' ? 'decline-md' : 'decline-lo';
      const declineTitle = declineMarked.has(t.num) ? 'Marked: will decline' : t.decline === 'high' ? 'Decline risk: high' : t.decline === 'medium' ? 'Decline risk: medium' : 'Decline risk: low';

      // Trend
      const trendHtml = tr_val === 'up' ? '<span class="trend-up" title="Improving trend"> ↑↑</span>' : tr_val === 'down' ? '<span class="trend-down" title="Declining trend"> ↓↓</span>' : '';

      // Watch/avoid badge
      const wsBadge = ws === 'watch' ? ' <span class="you-badge" style="background:rgba(34,211,238,0.12);color:#22d3ee;border-color:rgba(34,211,238,0.3);">★</span>' : ws === 'avoid' ? ' <span class="you-badge" style="background:var(--red-dim);color:#fb7185;border-color:var(--red-border);">⊘</span>' : '';

      const tr = document.createElement('tr');
      tr.className = (isPredGone ? 'pred-gone' : '') + (inA ? ' in-alliance' : '');
      tr.style.cursor = 'pointer';
      tr.onclick = (e) => { if (!e.target.closest('button,select')) toggleDetail(t.num); };

      tr.innerHTML =
        '<td><span class="rank-num">' + (isPredGone ? '—' : rank) + '</span></td>' +
        '<td style="padding-right:0;width:36px;"><div class="team-avatar-sm" style="' + avStyle + '">' + avLabel + '</div></td>' +
        '<td>' +
          '<span class="team-num">' + t.num + '</span> ' +
          '<span style="font-size:11px;color:var(--text-soft);">' + t.name + '</span>' +
          trendHtml + wsBadge +
          (isPredGone ? ' <span class="you-badge" style="background:rgba(255,255,255,0.06);color:var(--text-muted);">pred. gone</span>' : '') +
          (declineMarked.has(t.num) ? ' <span class="you-badge" style="background:var(--red-dim);color:#fb7185;border-color:var(--red-border);">decline</span>' : '') +
        '</td>' +
        '<td><span class="wlt">' + t.wlt + '</span></td>' +
        '<td><span class="opr-val">' + t.opr.toFixed(1) + '</span></td>' +
        '<td class="t-mono" style="color:var(--text-soft);">' + t.epa + '</td>' +
        '<td>' +
          '<span class="pool-climb ' + (CLIMB_CLS[t.climb] || 'climb-none') + '">' + cl + '</span> ' +
          '<span class="decline-dot ' + declineCls + '" onclick="event.stopPropagation();toggleDecline(\'' + t.num + '\')" title="' + declineTitle + ' — click to toggle"></span>' +
        '</td>' +
        '<td>' +
          '<div class="rely-wrap">' +
            '<div class="rely-bar-bg"><div class="rely-bar-fill" style="width:' + rely + '%;background:' + relyColor + ';"></div></div>' +
            '<span style="font-family:var(--mono);font-size:10px;color:' + relyColor + ';">' + rely + '%</span>' +
          '</div>' +
        '</td>' +
        '<td><span class="' + availCls + '">' + Math.round(avail_pct * 100) + '%</span></td>' +
        '<td><div class="fit-bar-wrap" style="width:68px;"><div class="fit-bar-fill" style="width:' + pct.toFixed(1) + '%"></div></div></td>' +
        '<td><span class="fit-score" style="font-size:13px;font-weight:600;">' + Math.round(fs) + '</span></td>' +
        '<td style="white-space:nowrap;padding-right:14px;" onclick="event.stopPropagation();">' +
          '<button class="pick-action-btn add' + (inA ? ' active' : '') + '" onclick="toggleAlliance(\'' + t.num + '\')">' + (inA ? '✓ picked' : '+ pick') + '</button> ' +
          '<button class="pick-action-btn watch' + (ws === 'watch' ? ' active' : '') + '" onclick="toggleWatch(\'' + t.num + '\',\'watch\')" title="Watchlist">★</button> ' +
          '<button class="pick-action-btn avoid' + (ws === 'avoid' ? ' active' : '') + '" onclick="toggleWatch(\'' + t.num + '\',\'avoid\')" title="Avoid">⊘</button> ' +
          '<button class="pick-action-btn gone-btn" onclick="markGone(\'' + t.num + '\')" title="Taken by another alliance">✗ gone</button>' +
        '</td>';
      tbody.appendChild(tr);

      // Expandable detail row
      if (isExpanded) {
        const notes = getTeamNotes(t.num);
        const detailTr = document.createElement('tr');
        detailTr.className = 'detail-row';

        // Sparkline
        let sparkHtml = '';
        if (t.matchScores && t.matchScores.length > 0) {
          const maxS = Math.max(...t.matchScores);
          const minS = Math.min(...t.matchScores);
          sparkHtml = t.matchScores.map((s, mi) => {
            const h = Math.round(6 + ((s - minS) / Math.max(maxS - minS, 1)) * 28);
            return '<div class="spark-bar" style="height:' + h + 'px;" title="Q' + (mi+1) + ': ' + Math.round(s) + ' pts"></div>';
          }).join('');
        }

        const availColor = avail_pct >= 0.55 ? '#22d3ee' : avail_pct >= 0.3 ? '#facc15' : '#fb7185';
        const sdVal = t.matchScores ? Math.round(stdDev(t.matchScores)) : '—';

        detailTr.innerHTML =
          '<td colspan="12">' +
            '<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:20px;">' +
              // Left: sparkline + range labels
              '<div>' +
                '<div class="ps-section-label" style="margin-bottom:10px;">Match performance · ' + (t.matchScores?.length || 0) + ' matches</div>' +
                '<div class="mini-spark" style="height:36px;">' + sparkHtml + '</div>' +
                '<div style="margin-top:6px;display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;color:var(--text-muted);">' +
                  '<span>low: ' + (t.matchScores ? Math.round(Math.min(...t.matchScores)) : '—') + '</span>' +
                  '<span>avg: ' + Math.round(t.opr) + '</span>' +
                  '<span>high: ' + (t.matchScores ? Math.round(Math.max(...t.matchScores)) : '—') + '</span>' +
                '</div>' +
              '</div>' +
              // Right: stat chips + notes
              '<div>' +
                '<div class="ps-chip-grid-4" style="margin-bottom:10px;">' +
                  '<div class="ps-chip"><div class="ps-chip-label">Reliability</div><div class="ps-chip-val" style="color:' + relyColor + ';">' + rely + '%</div></div>' +
                  '<div class="ps-chip"><div class="ps-chip-label">Std dev</div><div class="ps-chip-val">±' + sdVal + '</div></div>' +
                  '<div class="ps-chip"><div class="ps-chip-label">Avail est.</div><div class="ps-chip-val" style="color:' + availColor + ';">' + Math.round(avail_pct * 100) + '%</div></div>' +
                  '<div class="ps-chip"><div class="ps-chip-label">Fit score</div><div class="ps-chip-val" style="color:var(--accent);">' + Math.round(fs) + '</div></div>' +
                '</div>' +
                '<textarea class="note-input" rows="2" placeholder="Scouting notes — what makes this team stand out?" onchange="saveNoteText(\'' + t.num + '\',this.value)" onclick="event.stopPropagation();">' + notes.text + '</textarea>' +
              '</div>' +
            '</div>' +
          '</td>';
        tbody.appendChild(detailTr);
      }
    });

    // Update counters
    const trueCount = POOL.filter(t => !goneTeams.has(t.num) && !predSet.has(t.num)).length;
    document.getElementById('pool-size-val').textContent = trueCount;
    document.getElementById('pool-size-sub').textContent = 'available';
    document.getElementById('gone-count-val').textContent = goneTeams.size;
    renderGoneSection();
    renderWatchAvoidLists();
    renderMyAlliance();
    renderPredictedPicks();
  }

  // ── Toggle detail row ──
  function toggleDetail(num) {
    expandedTeam = expandedTeam === num ? null : num;
    renderPickPool();
  }

  function saveNoteText(num, text) { getTeamNotes(num).text = text; }

  // ── Alliance actions ──
  function toggleAlliance(num) {
    const idx = myAlliance.indexOf(num);
    if (idx > -1) myAlliance.splice(idx, 1);
    else if (myAlliance.length < 2) myAlliance.push(num);
    renderPickPool();
  }

  function clearAlliance() { myAlliance.length = 0; renderPickPool(); }

  // ── Gone / Decline ──
  function markGone(num) {
    goneTeams.add(num);
    const idx = myAlliance.indexOf(num);
    if (idx > -1) myAlliance.splice(idx, 1);
    if (expandedTeam === num) expandedTeam = null;
    renderPickPool();
  }

  function unmarkGone(num) { goneTeams.delete(num); renderPickPool(); }

  function toggleDecline(num) {
    if (declineMarked.has(num)) declineMarked.delete(num); else declineMarked.add(num);
    renderPickPool();
  }

  function renderGoneSection() {
    const section = document.getElementById('gone-section');
    const list    = document.getElementById('gone-count-label');
    if (goneTeams.size === 0) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    if (list) list.textContent = goneTeams.size + ' team' + (goneTeams.size !== 1 ? 's' : '');
    const listEl = document.getElementById('gone-list');
    if (!listEl) return;
    listEl.innerHTML = [...goneTeams].map(num => {
      const t = POOL.find(x => x.num === num);
      return '<div class="gone-row">' +
        '<span class="team-num" style="font-size:11px;opacity:0.5;">' + num + '</span>' +
        '<span style="flex:1;font-size:11px;color:var(--text-muted);">' + (t?.name || '') + '</span>' +
        '<span class="t-mono" style="font-size:10px;color:var(--text-muted);margin-right:6px;">' + (t ? t.opr.toFixed(1) + ' OPR' : '') + '</span>' +
        '<button class="pick-action-btn" onclick="unmarkGone(\'' + num + '\')">↩ undo</button></div>';
    }).join('');
  }

  // ── My Alliance ──
  function renderMyAlliance() {
    [0, 1].forEach(i => {
      const slot = document.getElementById('alliance-slot-' + i);
      if (!slot) return;
      const num = myAlliance[i];
      if (num) {
        const t = POOL.find(x => x.num === num);
        slot.className = 'alliance-pick-slot filled';
        slot.innerHTML =
          '<div class="team-avatar-sm">' + num.slice(0,2) + '</div>' +
          '<div style="flex:1;"><div class="aps-num">' + num + '</div><div class="aps-name">' + (t?.name || '') + '</div></div>' +
          '<div class="aps-opr">' + (t ? Math.round(t.opr) + ' OPR' : '') + '</div>' +
          '<button class="pick-action-btn avoid" onclick="toggleAlliance(\'' + num + '\')" style="margin-left:6px;">×</button>';
      } else {
        slot.className = 'alliance-pick-slot';
        slot.innerHTML = '<div style="font-size:11px;color:var(--text-muted);">+ ' + (i === 0 ? 'First pick' : 'Second pick') + '</div>';
      }
    });

    const projEl = document.getElementById('alliance-proj');
    const gapEl  = document.getElementById('weakness-gap');
    if (myAlliance.length === 0) { if (projEl) projEl.style.display = 'none'; if (gapEl) gapEl.style.display = 'none'; return; }

    const picks = myAlliance.map(n => POOL.find(x => x.num === n)).filter(Boolean);
    const all   = [MY_TEAM, ...picks].filter(Boolean);
    const totalOPR = all.reduce((s, t) => s + t.opr, 0);
    const climbRank = { L3: 3, L2: 2, L1: 1, none: 0 };
    const bestClimb = all.reduce((b, t) => climbRank[t.climb] > climbRank[b] ? t.climb : b, 'none');
    const fieldAvg3 = 152 * 3;
    const wr = Math.round(Math.min(93, Math.max(10, 50 + (totalOPR - fieldAvg3) / fieldAvg3 * 130)));

    if (projEl) {
      projEl.style.display = 'block';
      document.getElementById('proj-opr').textContent = totalOPR.toFixed(1);
      document.getElementById('proj-climb').textContent = bestClimb;
      document.getElementById('proj-wr').textContent = wr + '%';
    }

    // Gap analysis
    if (gapEl) {
      gapEl.style.display = 'block';
      const TARGET_OPR = 480;
      const oprPct  = Math.min(100, Math.round(totalOPR / TARGET_OPR * 100));
      const l3Count = all.filter(t => t.climb === 'L3').length;
      const climbPct = Math.min(100, Math.round((l3Count / 2) * 100)); // want at least 2 L3 climbers
      const avgRely = Math.round(all.reduce((s, t) => s + reliability(t), 0) / all.length);

      const gapColor = (pct) => pct >= 80 ? '#22d3ee' : pct >= 55 ? '#facc15' : '#fb7185';
      let rec = '';
      if (myAlliance.length === 1) {
        const pickedT = picks[0];
        const needsClimb = l3Count < 2;
        const needsScore = totalOPR < 380;
        if (needsScore && needsClimb) rec = 'Both scoring and climb depth needed for pick 2.';
        else if (needsScore) rec = 'Prioritize a high-OPR scorer for pick 2.';
        else if (needsClimb) rec = 'Pick 2: target an L3 climber for endgame insurance.';
        else rec = 'Alliance looks strong — take best available.';
      }

      document.getElementById('gap-content').innerHTML =
        '<div class="gap-row"><span class="gap-label">Scoring</span><div class="gap-bar-bg"><div class="gap-bar-fill" style="width:' + oprPct + '%;background:' + gapColor(oprPct) + ';"></div></div><span class="gap-val">' + oprPct + '%</span></div>' +
        '<div class="gap-row"><span class="gap-label">Climb</span><div class="gap-bar-bg"><div class="gap-bar-fill" style="width:' + climbPct + '%;background:' + gapColor(climbPct) + ';"></div></div><span class="gap-val">' + climbPct + '%</span></div>' +
        '<div class="gap-row"><span class="gap-label">Reliability</span><div class="gap-bar-bg"><div class="gap-bar-fill" style="width:' + avgRely + '%;background:' + gapColor(avgRely) + ';"></div></div><span class="gap-val">' + avgRely + '%</span></div>' +
        (rec ? '<div class="gap-note" style="color:var(--accent);">→ ' + rec + '</div>' : '');
    }
  }

  // ── Predicted picks (draft sim) ──
  function setPredictedPick(alliance, num) {
    predictedPicks[alliance] = num || null;
    renderPickPool();
  }

  function renderPredictedPicks() {
    const container = document.getElementById('pred-picks-list');
    const summary   = document.getElementById('pred-summary');
    if (!container) return;

    const available = POOL.filter(t => !goneTeams.has(t.num)).sort((a, b) => b.opr - a.opr);
    const predSet   = new Set(Object.values(predictedPicks).filter(Boolean));

    const alliances = ['A1', 'A2', 'A3', 'A4'];
    container.innerHTML = alliances.map(key => {
      const cur  = predictedPicks[key];
      const opts = available.map(t =>
        '<option value="' + t.num + '"' + (cur === t.num ? ' selected' : '') + '>' + t.num + ' · ' + t.name + '</option>'
      ).join('');
      return '<div class="pred-row">' +
        '<span class="pred-alliance-label">' + key + '</span>' +
        '<select class="pred-select" onchange="setPredictedPick(\'' + key + '\',this.value)">' +
          '<option value="">— unpredicted —</option>' + opts +
        '</select>' +
      '</div>';
    }).join('');

    // Summary
    const setPicks = Object.values(predictedPicks).filter(Boolean);
    if (setPicks.length > 0 && summary) {
      const bestLeft = POOL.filter(t => !goneTeams.has(t.num) && !predSet.has(t.num))
        .sort((a, b) => b.opr - a.opr)[0];
      summary.innerHTML = setPicks.length + ' alliance' + (setPicks.length !== 1 ? 's' : '') + ' simulated. ' +
        (bestLeft ? 'Your best likely pick: <strong style="color:var(--text);">' + bestLeft.num + ' ' + bestLeft.name + '</strong> (' + bestLeft.opr.toFixed(1) + ' OPR).' : 'Pool may be empty.');
    } else if (summary) {
      summary.innerHTML = 'Set predicted picks above to see who\'s likely left for you.';
    }
  }

  // ── Watch / Avoid ──
  function toggleWatch(num, type) {
    watchState[num] = watchState[num] === type ? null : type;
    if (watchState[num] === null) delete watchState[num];
    renderPickPool();
  }

  function renderWatchAvoidLists() {
    const watching = Object.keys(watchState).filter(k => watchState[k] === 'watch');
    const avoiding = Object.keys(watchState).filter(k => watchState[k] === 'avoid');
    document.getElementById('watchlist-count').textContent = watching.length + ' teams';
    document.getElementById('watchlist-section').innerHTML = watching.length === 0
      ? '<div style="font-size:11px;color:var(--text-muted);padding:6px 0;">No teams flagged yet.</div>'
      : watching.map(num => {
          const t = POOL.find(x => x.num === num);
          return '<div class="watchlist-item"><div class="watch-indicator watch-green"></div>' +
            '<span style="font-family:var(--mono);font-size:12px;width:40px;">' + num + '</span>' +
            '<span style="flex:1;font-size:12px;color:var(--text-soft);">' + (t?.name || '') + '</span>' +
            '<button class="watch-btn active" onclick="toggleWatch(\'' + num + '\',\'watch\')">×</button></div>';
        }).join('');
    document.getElementById('avoid-section').innerHTML = avoiding.length === 0
      ? '<div style="font-size:11px;color:var(--text-muted);padding:4px 0;">No teams avoided.</div>'
      : avoiding.map(num => {
          const t = POOL.find(x => x.num === num);
          return '<div class="watchlist-item"><div class="watch-indicator watch-red"></div>' +
            '<span style="font-family:var(--mono);font-size:12px;width:40px;">' + num + '</span>' +
            '<span style="flex:1;font-size:12px;color:var(--text-soft);">' + (t?.name || '') + '</span>' +
            '<button class="avoid-btn active" onclick="toggleWatch(\'' + num + '\',\'avoid\')">×</button></div>';
        }).join('');
  }

  function tcToggle(btn) {
    const details = btn.nextElementSibling;
    const hidden = details.hasAttribute('hidden');
    hidden ? details.removeAttribute('hidden') : details.setAttribute('hidden', '');
    btn.textContent = hidden ? 'Hide details' : 'Show details';
  }

  function setPillSort(btn, field) {
    document.querySelectorAll('.teams-top .btn-pill:not(.btn-pill-primary)').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function setMatchFilter(btn, filter) {
    document.querySelectorAll('#page-matches .btn-pill:not(.btn-pill-primary)').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  const MATCH_DATA = {
    'Q1': { title:'Qualification Match 1', redScore:'148', blueScore:'121', winner:'Red Alliance', winnerColor:'#fda4af', margin:'+27', coverage:'6/6', status:'● scouted', statusClass:'pill-green' },
    'Q2': { title:'Qualification Match 2', redScore:'—', blueScore:'—', winner:'In progress', winnerColor:'#facc15', margin:'—', coverage:'3/6', status:'● live', statusClass:'pill-blue' },
    'Q3': { title:'Qualification Match 3', redScore:'—', blueScore:'—', winner:'Not played', winnerColor:'var(--text-muted)', margin:'—', coverage:'0/6', status:'unscouted', statusClass:'pill-grey' },
    'Q4': { title:'Qualification Match 4', redScore:'109', blueScore:'137', winner:'Blue Alliance', winnerColor:'#93c5fd', margin:'+28', coverage:'5/6', status:'● scouted', statusClass:'pill-green' },
    'Q5': { title:'Qualification Match 5', redScore:'152', blueScore:'130', winner:'Red Alliance', winnerColor:'#fda4af', margin:'+22', coverage:'4/6', status:'partial', statusClass:'' },
  };

  function showMatch(id) {
    const d = MATCH_DATA[id] || MATCH_DATA['Q1'];
    document.getElementById('md-eyebrow').textContent = id + ' · Ontario Provincial 2026';
    document.getElementById('md-title').textContent = d.title;
    document.getElementById('md-red-score').textContent = d.redScore;
    document.getElementById('md-blue-score').textContent = d.blueScore;
    document.getElementById('md-red-score-big').textContent = d.redScore;
    document.getElementById('md-blue-score-big').textContent = d.blueScore;
    document.getElementById('md-winner').textContent = d.winner;
    document.getElementById('md-winner').style.color = d.winnerColor;
    document.getElementById('md-margin').textContent = d.margin;
    document.getElementById('md-coverage').textContent = d.coverage;
    const pill = document.getElementById('md-status-pill');
    pill.textContent = d.status;
    pill.className = 'pill ' + d.statusClass;
    pill.style.fontSize = '10px';
    show('matchdetail');
  }

  const TEAM_DATA = {
    '1114': { name:'Simbotics', rank:'#1', opr:'247.3', epa:'198', wl:'9–1', rp:'28', climb:'L3', fuel:'12.4', logs:'10 logs', avatarBg:'rgba(59,130,246,0.15)', avatarColor:'#93c5fd', avatarBorder:'rgba(59,130,246,0.2)', avatarText:'11' },
    '2056': { name:'OP Robotics', rank:'#2', opr:'231.8', epa:'182', wl:'8–2', rp:'24', climb:'L3', fuel:'11.1', logs:'9 logs', avatarBg:'rgba(168,85,247,0.15)', avatarColor:'#c4b5fd', avatarBorder:'rgba(168,85,247,0.2)', avatarText:'20' },
    '610':  { name:'Crescent Crew', rank:'#3', opr:'198.4', epa:'165', wl:'8–2', rp:'24', climb:'L3', fuel:'9.8', logs:'8 logs', avatarBg:'rgba(34,211,238,0.15)', avatarColor:'#22d3ee', avatarBorder:'rgba(34,211,238,0.2)', avatarText:'61' },
    '4069': { name:'WARHawks', rank:'#4', opr:'184.7', epa:'151', wl:'7–3', rp:'22', climb:'L2', fuel:'9.1', logs:'6 logs', avatarBg:'rgba(250,204,21,0.12)', avatarColor:'#facc15', avatarBorder:'rgba(250,204,21,0.2)', avatarText:'40' },
    '6632': { name:'Astro Falcons', rank:'#5', opr:'176.2', epa:'144', wl:'7–3', rp:'20', climb:'L3', fuel:'8.6', logs:'4 logs', avatarBg:'rgba(202,138,4,0.2)', avatarColor:'#fbbf24', avatarBorder:'rgba(202,138,4,0.3)', avatarText:'A' },
    '771':  { name:'SWAT', rank:'#6', opr:'163.9', epa:'138', wl:'6–4', rp:'18', climb:'L2', fuel:'7.9', logs:'7 logs', avatarBg:'rgba(255,255,255,0.06)', avatarColor:'var(--text-muted)', avatarBorder:'var(--border)', avatarText:'77' },
    '5031': { name:'Patriots', rank:'#7', opr:'159.1', epa:'130', wl:'6–4', rp:'18', climb:'L1', fuel:'7.4', logs:'5 logs', avatarBg:'rgba(255,255,255,0.06)', avatarColor:'var(--text-muted)', avatarBorder:'var(--border)', avatarText:'50' },
    '854':  { name:'Ti-84s', rank:'#8', opr:'148.3', epa:'122', wl:'5–5', rp:'16', climb:'L1', fuel:'6.8', logs:'3 logs', avatarBg:'rgba(255,255,255,0.06)', avatarColor:'var(--text-muted)', avatarBorder:'var(--border)', avatarText:'85' },
  };

  function showTeam(num) {
    const d = TEAM_DATA[num] || TEAM_DATA['1114'];
    document.getElementById('td-eyebrow').textContent = 'Team ' + num + ' · Ontario Provincial 2026';
    document.getElementById('td-name').textContent = d.name;
    const av = document.getElementById('td-avatar');
    av.textContent = d.avatarText;
    av.style.background = d.avatarBg;
    av.style.color = d.avatarColor;
    av.style.borderColor = d.avatarBorder;
    document.getElementById('td-rank').textContent = d.rank;
    document.getElementById('td-opr').textContent = d.opr;
    document.getElementById('td-epa').textContent = d.epa;
    document.getElementById('td-wl').textContent = d.wl;
    document.getElementById('td-rp').textContent = d.rp;
    document.getElementById('td-climb').textContent = d.climb;
    document.getElementById('td-fuel').textContent = d.fuel;
    document.getElementById('td-logs').textContent = d.logs;
    show('teamdetail');
  }

  function setRole(role) {
    currentRole = role;
    document.querySelectorAll('#role-chips .role-chip').forEach(c => c.classList.toggle('active', c.dataset.role === role));
    renderPickPool();
  }

  // ═══════════════ Unmatched Logs ═══════════════
  function toggleUml(id) {
    document.getElementById(id).classList.toggle('open');
  }

  function resolveUml(num) {
    const matchInput = document.getElementById('uml-' + num + '-match');
    const teamInput  = document.getElementById('uml-' + num + '-team');
    const errEl      = document.getElementById('uml-' + num + '-err');
    const matchVal   = matchInput ? matchInput.value.trim() : '';
    const teamVal    = teamInput  ? teamInput.value.trim()  : '';

    if (!matchVal || !teamVal) {
      errEl.textContent = 'Enter a corrected match # and team # before saving.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    // Simulate success: remove the card and update counts
    const card = document.getElementById('uml-card-' + num);
    if (card) card.style.transition = 'opacity 0.2s';
    if (card) card.style.opacity = '0';
    setTimeout(() => {
      if (card) card.remove();
      updateUmlCounts();
    }, 200);
  }

  function discardUml(num) {
    const card = document.getElementById('uml-card-' + num);
    if (card) card.style.transition = 'opacity 0.2s';
    if (card) card.style.opacity = '0';
    setTimeout(() => {
      if (card) card.remove();
      updateUmlCounts();
    }, 200);
  }

  function updateUmlCounts() {
    const remaining = document.querySelectorAll('#uml-list .uml-card').length;
    const badge = document.getElementById('unmatched-badge');
    const countEl = document.getElementById('uml-count');
    if (badge)   badge.textContent = remaining;
    if (countEl) countEl.textContent = remaining;
    if (remaining === 0) {
      document.getElementById('uml-empty').style.display = 'block';
      if (badge) badge.style.display = 'none';
    }
  }

  // ═══════════════ Init ═══════════════
  document.addEventListener('DOMContentLoaded', () => {
    show('dashboard');
    renderPickPool();
  });


