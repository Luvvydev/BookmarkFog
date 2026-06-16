const Core = window.BookmarkFogCore;
const $ = (id) => document.getElementById(id);

let app = {
  settings: null,
  analysis: null,
  filter: 'all',
  search: '',
  selected: new Set(),
  visibleIds: []
};

function toast(message) {
  const node = $('toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => node.classList.remove('visible'), 4200);
}

function pct(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function setBusy(button, busy, text = 'Working') {
  if (!button) return;
  if (busy) {
    button.dataset.oldText = button.textContent;
    button.textContent = text;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.oldText || button.textContent;
    button.disabled = false;
  }
}

function destinationLabel(settings = app.settings || Core.DEFAULT_SETTINGS) {
  return (settings.organizeDestination || Core.DEFAULT_SETTINGS.organizeDestination) === 'bookmarksBar'
    ? 'Bookmarks Bar'
    : 'Other Bookmarks';
}

function safeOrganizeItems() {
  if (!app.analysis) return [];
  return app.analysis.suggestions.filter((item) => item.actionType === 'organize' && item.folder !== 'Archive / Unsorted');
}

function currentItems() {
  if (!app.analysis) return [];
  if (app.filter === 'empty') return app.analysis.emptyFolders.map((folder) => ({ ...folder, actionType: 'empty', itemKind: 'folder' }));
  return app.analysis.suggestions.filter((item) => {
    if (app.filter === 'all') return true;
    return item.actionType === app.filter;
  });
}

function filteredItems() {
  const query = app.search.trim().toLowerCase();
  const items = currentItems();
  if (!query) return items;
  return items.filter((item) => {
    const haystack = [item.title, item.url, item.hostname, item.path, item.folder, item.reason, item.rootTitle].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

function updateStats() {
  const stats = app.analysis?.stats || {};
  $('totalBookmarks').textContent = stats.totalBookmarks || 0;
  $('suggestedMoves').textContent = stats.suggestedMoves || 0;
  $('protectedBookmarks').textContent = stats.protectedBookmarks || 0;
  $('nsfwCount').textContent = stats.nsfwCount || 0;
  $('duplicateCount').textContent = stats.duplicateCount || 0;
  $('emptyFolderCount').textContent = stats.emptyFolderCount || 0;
}

function renderCategories() {
  const node = $('categoryGrid');
  if (!app.analysis) {
    node.className = 'categoryGrid emptyState';
    node.textContent = 'Run scan to see categories.';
    return;
  }
  const entries = Object.entries(app.analysis.categoryCounts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    node.className = 'categoryGrid emptyState';
    node.textContent = 'No new safe moves found. Already organized bookmarks stay visible in All.';
    return;
  }
  node.className = 'categoryGrid';
  const iconMap = Object.fromEntries(Core.CATEGORY_RULES.map((rule) => [rule.folder, rule.icon]));
  iconMap['Archive / Unsorted'] = '🗂️';
  iconMap['Possible NSFW'] = '🔞';
  node.innerHTML = entries.map(([folder, count]) => `
    <article class="categoryCard">
      <span>${iconMap[folder] || '📁'}</span>
      <strong>${Core.escapeHtml(folder)}</strong>
      <p>${count} bookmark${count === 1 ? '' : 's'}</p>
    </article>
  `).join('');
}

function renderProtectedPreview() {
  const node = $('protectedPreview');
  const items = app.analysis?.protectedBarItems || [];
  if (!items.length) {
    node.className = 'protectedPreview emptyState';
    node.textContent = app.analysis ? 'No protected top bar items found.' : 'Run scan to preview protected top bar items.';
    return;
  }
  node.className = 'protectedPreview';
  node.innerHTML = items.map((item) => `<span>${item.isFolder ? '📁' : '🔖'} ${Core.escapeHtml(item.title)}</span>`).join('');
}

function itemCheckbox(item) {
  const disabled = item.isProtected ? 'disabled' : '';
  const checked = app.selected.has(item.id) ? 'checked' : '';
  return `<input class="checkbox rowCheck" data-id="${item.id}" type="checkbox" ${checked} ${disabled} />`;
}

function renderBookmarkItem(item) {
  const classes = ['bookmarkItem', item.actionType, item.itemKind === 'folderMove' ? 'folderMoveItem' : ''].filter(Boolean).join(' ');
  const folderBadge = item.isProtected
    ? '<span class="badge lock">Locked</span>'
    : item.isNsfw
      ? '<span class="badge danger">Review</span>'
      : item.isDuplicate
        ? '<span class="badge warn">Duplicate</span>'
        : item.isAlreadyOrganized
          ? `<span class="badge done">Done in ${Core.escapeHtml(destinationLabel())}</span>`
          : item.actionType === 'foldered'
            ? '<span class="badge done">Kept inside folder</span>'
            : item.itemKind === 'folderMove'
              ? `<span class="badge folder">📁 Folder → ${Core.escapeHtml(item.folder)}</span>`
              : `<span class="badge folder">→ ${Core.escapeHtml(item.folder)}</span>`;
  const confidence = item.isProtected || item.isAlreadyOrganized || item.actionType === 'foldered' ? '' : `<span class="badge">${pct(item.confidence)}</span>`;
  const date = Core.formatDate(item.dateAdded);
  const titleIcon = item.itemKind === 'folderMove' ? '📁' : (item.icon || (item.isProtected ? '🛡️' : '🔖'));
  const locationLine = item.itemKind === 'folderMove' ? 'Existing folder, contents stay together' : Core.escapeHtml(item.hostname || item.url);
  const metaPrefix = item.itemKind === 'folderMove' ? 'Move whole folder' : Core.escapeHtml(item.reason || 'No reason');
  return `
    <article class="${classes}">
      ${itemCheckbox(item)}
      <div class="itemMain">
        <div class="itemTitleLine">
          <span class="itemIcon">${titleIcon}</span>
          <div class="itemTitle" title="${Core.escapeHtml(item.title)}">${Core.escapeHtml(item.title)}</div>
        </div>
        <div class="itemUrl" title="${Core.escapeHtml(item.url || item.title)}">${locationLine}</div>
        <div class="itemPath">${Core.escapeHtml(item.path || item.rootTitle || 'No folder path')}</div>
        <div class="itemMeta">${metaPrefix}${item.itemKind === 'folderMove' ? ` · ${Core.escapeHtml(item.reason || '')}` : ''} · Added ${date}</div>
      </div>
      <div class="itemBadges">
        ${folderBadge}
        ${confidence}
      </div>
    </article>
  `;
}

function renderFolderItem(folder) {
  const checked = app.selected.has(folder.id) ? 'checked' : '';
  return `
    <article class="emptyFolderItem">
      <input class="checkbox rowCheck" data-id="${folder.id}" type="checkbox" ${checked} />
      <div class="itemMain">
        <div class="itemTitleLine">
          <span class="itemIcon">📁</span>
          <div class="itemTitle">${Core.escapeHtml(folder.title)}</div>
        </div>
        <div class="itemPath">${Core.escapeHtml(folder.path || folder.rootTitle || 'No folder path')}</div>
        <div class="itemMeta">Empty folder outside protected bar</div>
      </div>
      <div class="itemBadges"><span class="badge warn">Empty</span></div>
    </article>
  `;
}

function renderSuggestionsList() {
  const node = $('suggestionsList');
  const items = filteredItems();
  app.visibleIds = items.map((item) => item.id);
  if (!app.analysis) {
    node.className = 'list emptyState';
    node.textContent = 'Run scan to load bookmarks.';
    return;
  }
  if (!items.length) {
    node.className = 'list emptyState';
    node.textContent = 'Nothing matches this view.';
    return;
  }
  node.className = 'list';
  node.innerHTML = items.map((item) => item.itemKind === 'folder' ? renderFolderItem(item) : renderBookmarkItem(item)).join('');
  wireCheckboxes(node);
}

function renderNsfwList() {
  const node = $('nsfwList');
  const items = app.analysis?.nsfw || [];
  if (!app.analysis) {
    node.className = 'list emptyState';
    node.textContent = 'Run scan to check for flagged links.';
    return;
  }
  if (!items.length) {
    node.className = 'list emptyState';
    node.textContent = 'No NSFW bookmarks flagged outside the protected bar.';
    return;
  }
  node.className = 'list';
  node.innerHTML = items.map(renderBookmarkItem).join('');
  wireCheckboxes(node);
}

function renderDuplicateList() {
  const node = $('dupeList');
  const groups = app.analysis?.duplicates || [];
  if (!app.analysis) {
    node.className = 'list emptyState';
    node.textContent = 'Run scan to find duplicates.';
    return;
  }
  if (!groups.length) {
    node.className = 'list emptyState';
    node.textContent = 'No duplicate URLs found outside the protected bar.';
    return;
  }
  const duplicateItems = app.analysis.suggestions.filter((item) => item.isDuplicate && !item.isProtected);
  node.className = 'list';
  node.innerHTML = duplicateItems.map(renderBookmarkItem).join('');
  wireCheckboxes(node);
}

function renderEmptyFolders() {
  const node = $('emptyList');
  const folders = app.analysis?.emptyFolders || [];
  if (!app.analysis) {
    node.className = 'list emptyState';
    node.textContent = 'Run scan to find empty folders.';
    return;
  }
  if (!folders.length) {
    node.className = 'list emptyState';
    node.textContent = 'No empty folders found outside the protected bar.';
    return;
  }
  node.className = 'list';
  node.innerHTML = folders.map(renderFolderItem).join('');
  wireCheckboxes(node);
}

function wireCheckboxes(scope) {
  scope.querySelectorAll('.rowCheck').forEach((box) => {
    box.addEventListener('change', () => {
      if (box.checked) app.selected.add(box.dataset.id);
      else app.selected.delete(box.dataset.id);
      updateSelectionBar();
      syncCheckboxes();
    });
  });
}

function syncCheckboxes() {
  document.querySelectorAll('.rowCheck').forEach((box) => {
    box.checked = app.selected.has(box.dataset.id);
  });
}

function updateSelectionBar() {
  const count = app.selected.size;
  $('selectedCount').textContent = count;
  $('selectionBar').classList.toggle('visible', count > 0);
}

function renderAll() {
  updateStats();
  renderCategories();
  renderProtectedPreview();
  renderSuggestionsList();
  renderNsfwList();
  renderDuplicateList();
  renderEmptyFolders();
  updateSelectionBar();
  syncCheckboxes();
}

async function runScan() {
  const btn = $('scanBtn');
  setBusy(btn, true, 'Scanning');
  try {
    const result = await Core.analyzeBookmarks(app.settings);
    app.settings = result.settings;
    app.analysis = result.analysis;
    app.selected.clear();
    renderSettings();
    renderAll();
    toast(`Scan complete: ${result.analysis.stats.suggestedMoves} safe move(s). Existing folders stay together. Destination: ${destinationLabel(app.settings)}.`);
  } catch (error) {
    toast(`Scan failed: ${error.message}`);
  } finally {
    setBusy(btn, false);
  }
}

function getItemsBySelected() {
  if (!app.analysis || !app.selected.size) return [];
  const bookmarkItems = app.analysis.suggestions.filter((item) => app.selected.has(item.id));
  const folderItems = app.analysis.emptyFolders.filter((item) => app.selected.has(item.id));
  return { bookmarkItems, folderItems };
}

async function applyOrganizeSelected() {
  const { bookmarkItems } = getItemsBySelected();
  const safeItems = bookmarkItems.filter((item) => item.actionType === 'organize');
  if (!safeItems.length) {
    toast('No selected safe moves found. Use Select safe moves or Organize safe now.');
    return;
  }
  const btn = $('applyOrganizeBtn');
  setBusy(btn, true, 'Moving');
  try {
    const ops = await Core.organizeBookmarks(safeItems, app.settings);
    toast(`Moved ${ops.filter((op) => op.type === 'move').length} item(s) into ${destinationLabel(app.settings)} folders.`);
    app.selected.clear();
    await runScan();
  } catch (error) {
    toast(`Move failed: ${error.message}`);
  } finally {
    setBusy(btn, false);
  }
}

async function organizeSafeNow() {
  if (!app.analysis) await runScan();
  const safeItems = safeOrganizeItems();
  if (!safeItems.length) {
    toast('No safe bookmark moves found. Flagged, duplicate, protected, and unsorted items are skipped.');
    return;
  }
  const destination = destinationLabel(app.settings);
  if (!confirm(`Move ${safeItems.length} safe item(s) into "${app.settings.rootFolderName}" folders inside ${destination}? Existing folders will move as whole folders.`)) return;
  const buttons = [$('organizeSafeBtn'), $('panelOrganizeSafeBtn')];
  buttons.forEach((button) => setBusy(button, true, 'Moving'));
  try {
    const ops = await Core.organizeBookmarks(safeItems, app.settings);
    toast(`Moved ${ops.filter((op) => op.type === 'move').length} item(s) into ${destination} folders.`);
    app.selected.clear();
    await runScan();
  } catch (error) {
    toast(`Organize failed: ${error.message}`);
  } finally {
    buttons.forEach((button) => setBusy(button, false));
  }
}

async function quarantineSelected(reason = 'Review') {
  const { bookmarkItems } = getItemsBySelected();
  const items = bookmarkItems.filter((item) => !item.isProtected);
  if (!items.length) {
    toast('No selected bookmarks can be quarantined.');
    return;
  }
  const btn = reason.includes('NSFW') ? $('quarantineNsfwBtn') : reason.includes('Duplicate') ? $('quarantineDupesBtn') : $('quarantineBtn');
  setBusy(btn, true, 'Quarantine');
  try {
    const ops = await Core.quarantineBookmarks(items, app.settings, reason);
    toast(`Quarantined ${ops.filter((op) => op.type === 'move').length} bookmark(s).`);
    app.selected.clear();
    await runScan();
  } catch (error) {
    toast(`Quarantine failed: ${error.message}`);
  } finally {
    setBusy(btn, false);
  }
}

async function deleteFlaggedNsfw() {
  const items = app.analysis?.nsfw || [];
  if (!items.length) {
    toast('No flagged links to delete.');
    return;
  }
  const firstConfirm = confirm('This permanently deletes flagged bookmarks outside the protected bar. A JSON backup will be created first. Quarantine is safer. Continue?');
  if (!firstConfirm) return;
  const typed = prompt('Type DELETE to permanently remove flagged bookmarks.');
  if (typed !== 'DELETE') {
    toast('Permanent delete cancelled.');
    return;
  }
  const btn = $('deleteNsfwBtn');
  setBusy(btn, true, 'Deleting');
  try {
    const ops = await Core.deleteBookmarks(items, app.settings);
    toast(`Deleted ${ops.filter((op) => op.type === 'delete').length} flagged bookmark(s).`);
    app.selected.clear();
    await runScan();
  } catch (error) {
    toast(`Delete failed: ${error.message}`);
  } finally {
    setBusy(btn, false);
  }
}

async function removeSelectedEmptyFolders() {
  const { folderItems } = getItemsBySelected();
  if (!folderItems.length) {
    toast('No empty folders selected.');
    return;
  }
  if (!confirm(`Remove ${folderItems.length} empty folder(s)? A JSON backup will be created first.`)) return;
  const btn = $('removeEmptyBtn');
  setBusy(btn, true, 'Removing');
  try {
    const ops = await Core.removeEmptyFolders(folderItems, app.settings);
    toast(`Removed ${ops.filter((op) => op.type === 'removeFolder').length} empty folder(s).`);
    app.selected.clear();
    await runScan();
  } catch (error) {
    toast(`Folder cleanup failed: ${error.message}`);
  } finally {
    setBusy(btn, false);
  }
}

function selectWhere(predicate) {
  if (!app.analysis) return;
  app.analysis.suggestions.forEach((item) => {
    if (predicate(item)) app.selected.add(item.id);
  });
  renderAll();
}

function selectEmptyFolders() {
  if (!app.analysis) return;
  app.analysis.emptyFolders.forEach((folder) => app.selected.add(folder.id));
  renderAll();
}

function selectVisible() {
  app.visibleIds.forEach((id) => {
    const item = app.analysis?.suggestions.find((entry) => entry.id === id) || app.analysis?.emptyFolders.find((entry) => entry.id === id);
    if (item && !item.isProtected) app.selected.add(id);
  });
  renderAll();
}

function clearSelected() {
  app.selected.clear();
  renderAll();
}

function switchTab(tab) {
  document.querySelectorAll('.navItem').forEach((item) => item.classList.toggle('active', item.dataset.tab === tab));
  document.querySelectorAll('.tabPanel').forEach((panel) => panel.classList.remove('active'));
  $(`${tab}Tab`).classList.add('active');
  const filterByTab = { nsfw: 'nsfw', duplicates: 'duplicate' };
  if (filterByTab[tab]) {
    app.filter = filterByTab[tab];
    updateFilterChips();
    renderSuggestionsList();
  }
}

function updateFilterChips() {
  document.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('active', chip.dataset.filter === app.filter));
}

function renderSettings() {
  const settings = app.settings || Core.DEFAULT_SETTINGS;
  $('protectBarInput').checked = !!settings.protectBookmarksBar;
  $('autoBackupInput').checked = !!settings.autoBackupBeforeChanges;
  $('keepFoldersTogetherInput').checked = settings.keepExistingFoldersTogether !== false;
  $('organizeDestinationInput').value = settings.organizeDestination || Core.DEFAULT_SETTINGS.organizeDestination;
  $('protectTopBarLimitInput').value = Number(settings.protectTopBarLimit ?? Core.DEFAULT_SETTINGS.protectTopBarLimit) || 0;
  $('rootFolderInput').value = settings.rootFolderName;
  $('quarantineFolderInput').value = settings.quarantineFolderName;
}

async function saveSettings() {
  app.settings = {
    ...app.settings,
    protectBookmarksBar: $('protectBarInput').checked,
    autoBackupBeforeChanges: $('autoBackupInput').checked,
    keepExistingFoldersTogether: $('keepFoldersTogetherInput').checked,
    organizeDestination: $('organizeDestinationInput').value === 'otherBookmarks' ? 'otherBookmarks' : 'bookmarksBar',
    protectTopBarLimit: Math.max(0, Math.min(50, Number($('protectTopBarLimitInput').value) || 0)),
    rootFolderName: $('rootFolderInput').value.trim() || Core.DEFAULT_SETTINGS.rootFolderName,
    quarantineFolderName: $('quarantineFolderInput').value.trim() || Core.DEFAULT_SETTINGS.quarantineFolderName
  };
  await Core.saveSettings(app.settings);
  toast(`Settings saved. Organized folders will go to ${destinationLabel(app.settings)} after the next move.`);
}

async function exportJson(reason = 'manual-dashboard') {
  try {
    await Core.exportJsonBackup(reason);
    toast('JSON backup exported.');
  } catch (error) {
    toast(`Backup failed: ${error.message}`);
  }
}

async function exportHtml(reason = 'manual-dashboard') {
  try {
    await Core.exportHtmlBackup(reason);
    toast('HTML backup exported.');
  } catch (error) {
    toast(`HTML backup failed: ${error.message}`);
  }
}

async function restoreFromFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const restoreRoot = await Core.restoreBackupAsFolder(payload);
    toast(`Backup restored into safe folder: ${restoreRoot.title}.`);
    await runScan();
  } catch (error) {
    toast(`Restore failed: ${error.message}`);
  } finally {
    $('restoreInput').value = '';
  }
}

async function undoLastMove() {
  try {
    const ops = await Core.undoLastMoves();
    const count = ops.filter((op) => op.undone).length;
    toast(`Undo finished: ${count} move(s) restored.`);
    app.selected.clear();
    await runScan();
  } catch (error) {
    toast(`Undo failed: ${error.message}`);
  }
}

function wireEvents() {
  $('scanBtn').addEventListener('click', runScan);
  $('organizeSafeBtn').addEventListener('click', organizeSafeNow);
  $('panelOrganizeSafeBtn').addEventListener('click', organizeSafeNow);
  $('quickBackupBtn').addEventListener('click', () => exportJson('manual-quick'));
  $('backupJsonBtn').addEventListener('click', () => exportJson('manual-json'));
  $('backupHtmlBtn').addEventListener('click', () => exportHtml('manual-html'));
  $('restoreInput').addEventListener('change', (event) => restoreFromFile(event.target.files[0]));
  $('saveSettingsBtn').addEventListener('click', saveSettings);
  $('applyOrganizeBtn').addEventListener('click', applyOrganizeSelected);
  $('quarantineBtn').addEventListener('click', () => quarantineSelected('Review'));
  $('quarantineNsfwBtn').addEventListener('click', () => {
    app.selected.clear();
    selectWhere((item) => item.actionType === 'nsfw');
    quarantineSelected('NSFW Review');
  });
  $('quarantineDupesBtn').addEventListener('click', () => {
    app.selected.clear();
    selectWhere((item) => item.actionType === 'duplicate');
    quarantineSelected('Duplicate Review');
  });
  $('deleteNsfwBtn').addEventListener('click', deleteFlaggedNsfw);
  $('removeEmptyBtn').addEventListener('click', removeSelectedEmptyFolders);
  $('undoBtn').addEventListener('click', undoLastMove);
  $('selectVisibleBtn').addEventListener('click', selectVisible);
  $('clearSelectedBtn').addEventListener('click', clearSelected);
  $('selectOrganizeBtn').addEventListener('click', () => selectWhere((item) => item.actionType === 'organize' && item.folder !== 'Archive / Unsorted'));
  $('selectNsfwBtn').addEventListener('click', () => selectWhere((item) => item.actionType === 'nsfw'));
  $('selectDupesBtn').addEventListener('click', () => selectWhere((item) => item.actionType === 'duplicate'));
  $('selectEmptyBtn').addEventListener('click', selectEmptyFolders);

  $('searchInput').addEventListener('input', (event) => {
    app.search = event.target.value;
    renderSuggestionsList();
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      app.filter = chip.dataset.filter;
      updateFilterChips();
      renderSuggestionsList();
    });
  });

  document.querySelectorAll('.navItem').forEach((item) => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });
}

async function init() {
  app.settings = await Core.getSettings();
  renderSettings();
  wireEvents();
  renderAll();
  await runScan();
}

init();
