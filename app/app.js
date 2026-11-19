// Leonida Legends — GTA VI trophy guide & tracker.
// Loads app/data/trophies.json, renders the 55-trophy checklist, saves
// progress in localStorage, exports/imports it, filters by kind/grade/search
// and hides story spoilers until a trophy is earned. Runs fully offline:
// the only network request is the local trophies.json fetch.
const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';
const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  completion: 'Completion',
  platinum: 'Platinum',
  online: 'Online',
};

// Element ids, classes and data attributes below are the DOM contract with
// app/index.html — do not rename them.
const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const kindEl = document.getElementById('kindFilters');
const spoilerEl = document.getElementById('spoilerToggle');
const hideEarnedEl = document.getElementById('hideEarnedToggle');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeSummary = document.getElementById('gradeSummary');
const resultLine = document.getElementById('resultLine');
const onlineNote = document.getElementById('onlineNote');
const exportBtn = document.getElementById('exportBtn');
const importFileEl = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');

let trophies = [];
let earned = new Set(loadProgress());
let activeKind = 'all';

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

function countEarnedByGrade() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earned.has(trophy.name)) counts[trophy.grade]++;
  }
  return counts;
}

function countTotalByGrade() {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) totals[trophy.grade]++;
  return totals;
}

function updateProgressBar() {
  const total = trophies.length;
  const earnedCount = earned.size;
  const pct = total ? Math.round((earnedCount / total) * 100) : 0;
  progressText.textContent = `${earnedCount} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  const earnedByGrade = countEarnedByGrade();
  const totalByGrade = countTotalByGrade();
  gradeSummary.textContent =
    `Platinum ${earnedByGrade.platinum}/${totalByGrade.platinum} · ` +
    `Gold ${earnedByGrade.gold}/${totalByGrade.gold} · ` +
    `Silver ${earnedByGrade.silver}/${totalByGrade.silver} · ` +
    `Bronze ${earnedByGrade.bronze}/${totalByGrade.bronze}`;
}

function updateKindFilterCounts() {
  const countWhere = (predicate) => trophies.filter(predicate).length;
  // Update every count span the HTML provides; missing spans (e.g. no
  // completion/platinum button in this build) are skipped, not errors.
  const setCount = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `(${count})`;
  };
  setCount('countAll', trophies.length);
  setCount('countStory', countWhere((t) => t.kind === 'story'));
  setCount('countMissable', countWhere((t) => t.missable));
  setCount('countCollectibles', countWhere((t) => t.kind === 'collectibles'));
  setCount('countActivities', countWhere((t) => t.kind === 'activities'));
  setCount('countCompletion', countWhere((t) => t.kind === 'completion'));
  setCount('countPlatinum', countWhere((t) => t.kind === 'platinum'));
  setCount('countOnline', countWhere((t) => t.kind === 'online'));
}

function trophyPassesFilters(trophy) {
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  // 'missable' is a flag, not a kind; every other kind filters on t.kind,
  // so completion/platinum/online buttons work without new branches.
  if (activeKind === 'missable' && !trophy.missable) return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && trophy.kind !== activeKind) return false;
  if (hideEarnedEl.checked && earned.has(trophy.name)) return false;
  const query = searchEl.value.trim().toLowerCase();
  if (query && !(trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase().includes(query)) return false;
  return true;
}

function isSpoilerHidden(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function buildFlag(text, className) {
  const flag = document.createElement('span');
  flag.className = `flag ${className}`;
  flag.textContent = text;
  return flag;
}

function buildTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'trophy-card' + (earned.has(trophy.name) ? ' earned' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = earned.has(trophy.name);
  checkbox.setAttribute('aria-label', `Earned: ${trophy.name}`);
  checkbox.addEventListener('change', () => handleEarnedToggle(trophy, card, checkbox));

  const body = document.createElement('div');
  const head = document.createElement('div');
  head.className = 'trophy-head';

  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = isSpoilerHidden(trophy)
    ? 'Hidden story trophy — earn it to reveal'
    : trophy.name;
  head.append(name);

  const grade = document.createElement('span');
  grade.className = `grade-badge grade-${trophy.grade}`;
  grade.textContent = trophy.grade;
  head.append(grade);

  // Platinum kind would duplicate the grade badge, so skip its kind flag.
  if (trophy.kind !== 'platinum') {
    head.append(buildFlag(KIND_LABELS[trophy.kind] ?? trophy.kind, 'flag-kind'));
  }
  if (trophy.missable) head.append(buildFlag('⚠ Missable', 'flag-missable'));
  if (trophy.hidden) head.append(buildFlag('Hidden on PSN', 'flag-hidden'));
  body.append(head);

  if (isSpoilerHidden(trophy)) {
    const placeholder = document.createElement('p');
    placeholder.className = 'spoiler-hidden';
    placeholder.textContent = 'Name, description and guide hidden until earned — turn off “Hide story spoilers” to see it, or tick the box once you have earned it.';
    body.append(placeholder);
  } else {
    const official = document.createElement('p');
    official.className = 'official';
    const officialLabel = document.createElement('span');
    officialLabel.className = 'label';
    officialLabel.textContent = 'Official — ';
    official.append(officialLabel, document.createTextNode(`“${trophy.description}”`));
    body.append(official);

    if (trophy.count) {
      const target = document.createElement('p');
      target.className = 'count-target';
      target.textContent = `Target: ${trophy.count.toLocaleString('en-US')}`;
      body.append(target);
    }

    const guide = document.createElement('p');
    guide.className = 'guide';
    const guideLabel = document.createElement('span');
    guideLabel.className = 'label';
    guideLabel.textContent = 'Guide — ';
    guide.append(guideLabel, document.createTextNode(trophy.guide));
    body.append(guide);

    if (trophy.sources && trophy.sources.length) {
      const sources = document.createElement('p');
      sources.className = 'sources';
      sources.append(document.createTextNode('Sources: '));
      trophy.sources.forEach((source, i) => {
        if (i) sources.append(document.createTextNode(', '));
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = source.name;
        sources.append(link);
      });
      body.append(sources);
    }
  }

  card.append(checkbox, body);
  return card;
}

function buildEmptyMessage() {
  const message = document.createElement('p');
  message.className = 'empty';
  message.textContent = activeKind === 'online'
    ? 'No online trophies — GTA VI has 55 single-player trophies, all earnable offline.'
    : 'No trophies match these filters.';
  return message;
}

function updateResultLine() {
  const shown = listEl.querySelectorAll('.trophy-card').length;
  resultLine.textContent = `Showing ${shown} of ${trophies.length} · ${earned.size} earned`;
  const empty = listEl.querySelector('.empty');
  if (shown === 0 && !empty) listEl.append(buildEmptyMessage());
  if (shown > 0 && empty) empty.remove();
}

function renderTrophyList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyPassesFilters);
  for (const trophy of shown) listEl.append(buildTrophyCard(trophy));
  updateResultLine();
  onlineNote.hidden = activeKind !== 'online';
}

function renderAll() {
  updateProgressBar();
  updateKindFilterCounts();
  renderTrophyList();
}

// Ticking a box updates the card in place so keyboard focus is not lost to a
// full re-render. Only two cases need more: a just-earned card that must
// vanish under "Hide earned", and a story card whose spoiler state flips
// on earn AND on un-earn (un-earning re-hides it while spoilers are on).
function handleEarnedToggle(trophy, card, checkbox) {
  const wasSpoilerHidden = isSpoilerHidden(trophy);
  if (checkbox.checked) earned.add(trophy.name);
  else earned.delete(trophy.name);
  saveProgress();
  updateProgressBar();

  if (checkbox.checked && hideEarnedEl.checked) {
    card.remove();
    updateResultLine();
    return;
  }
  if (wasSpoilerHidden !== isSpoilerHidden(trophy)) {
    const freshCard = buildTrophyCard(trophy);
    card.replaceWith(freshCard);
    freshCard.querySelector('input[type="checkbox"]').focus();
    updateResultLine();
    return;
  }
  card.classList.toggle('earned', checkbox.checked);
  updateResultLine();
}

function exportProgress() {
  const data = {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    earned: [...earned].sort(),
    exportedAt: new Date().toISOString(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const validNames = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && validNames.has(n)));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
}

function resetProgress() {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveProgress();
  renderAll();
}

kindEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  activeKind = button.dataset.kind;
  kindEl.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === button));
  renderTrophyList();
});
searchEl.addEventListener('input', renderTrophyList);
gradeEl.addEventListener('change', renderTrophyList);
spoilerEl.addEventListener('change', renderTrophyList);
hideEarnedEl.addEventListener('change', renderTrophyList);
exportBtn.addEventListener('click', exportProgress);
importFileEl.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) await importProgress(file);
  event.target.value = '';
});
resetBtn.addEventListener('click', resetProgress);

try {
  const doc = await (await fetch('data/trophies.json')).json();
  trophies = doc.trophies;
  renderAll();
} catch {
  listEl.replaceChildren();
  const error = document.createElement('p');
  error.className = 'empty';
  error.textContent = 'Could not load the trophy list (data/trophies.json). Check the file is present and reload.';
  listEl.append(error);
  resultLine.textContent = 'Showing 0 of 0 · 0 earned';
}
