const Core = window.BookmarkFogCore;
const $ = (id) => document.getElementById(id);

function setStatus(text, sub) {
  $('statusText').textContent = text;
  $('subStatus').textContent = sub;
}

function renderStats(stats) {
  $('statTotal').textContent = stats.totalBookmarks || 0;
  $('statProtected').textContent = stats.protectedBookmarks || 0;
  $('statNsfw').textContent = stats.nsfwCount || 0;
  $('statDupes').textContent = stats.duplicateCount || 0;
}

function renderBarPreview(items) {
  const box = $('barPreview');
  if (!items.length) {
    box.textContent = 'No locked top bar items found.';
    return;
  }
  box.innerHTML = items.slice(0, 18).map((item) => `<span>${item.isFolder ? '📁' : '🔖'} ${Core.escapeHtml(item.title)}</span>`).join('');
}

async function runScan() {
  setStatus('Scanning', 'Reading local bookmarks only');
  $('runScan').disabled = true;
  try {
    const { analysis } = await Core.analyzeBookmarks();
    renderStats(analysis.stats);
    renderBarPreview(analysis.protectedBarItems);
    setStatus('Ready', `${analysis.stats.suggestedMoves} moves · ${analysis.stats.nsfwCount} flagged`);
  } catch (error) {
    setStatus('Error', error.message);
  } finally {
    $('runScan').disabled = false;
  }
}

function openDashboard() {
  chrome.runtime.openOptionsPage();
}

async function loadLastScan() {
  const stored = await chrome.storage.local.get(['bookmarkFogLastScan']);
  if (stored.bookmarkFogLastScan?.stats) {
    renderStats(stored.bookmarkFogLastScan.stats);
    setStatus('Ready', 'Last scan loaded');
  }
}

$('runScan').addEventListener('click', runScan);
$('openDashboard').addEventListener('click', openDashboard);
$('openFull').addEventListener('click', openDashboard);
$('allSettings').addEventListener('click', openDashboard);
$('backupJson').addEventListener('click', async () => {
  setStatus('Backup', 'Choose a save location');
  try {
    await Core.exportJsonBackup('manual-popup');
    setStatus('Backed up', 'JSON backup saved');
  } catch (error) {
    setStatus('Backup failed', error.message);
  }
});

loadLastScan();
runScan();
