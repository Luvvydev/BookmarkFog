(() => {
  const DEFAULT_SETTINGS = {
    protectBookmarksBar: true,
    protectTopBarLimit: 14,
    autoBackupBeforeChanges: true,
    organizeDestination: 'bookmarksBar',
    keepExistingFoldersTogether: true,
    rootFolderName: 'BookmarkFog Organized',
    quarantineFolderName: 'BookmarkFog Quarantine',
    duplicateFolderName: 'Duplicate Review',
    restoreFolderName: 'BookmarkFog Restored',
    includeMobileBookmarks: true
  };

  const CATEGORY_RULES = [
    {
      folder: 'Development',
      icon: '💻',
      terms: ['github', 'gitlab', 'stackoverflow', 'stack overflow', 'npm', 'node', 'react', 'vite', 'webpack', 'firebase', 'vercel', 'render', 'api', 'docs', 'documentation', 'developer', 'python', 'javascript', 'typescript', 'css', 'html', 'mdn', 'codecademy', 'leetcode', 'docker', 'localhost'],
      domains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'developer.mozilla.org', 'npmjs.com', 'firebase.google.com', 'vercel.com', 'render.com', 'docs.github.com']
    },
    {
      folder: 'Chess',
      icon: '♟️',
      terms: ['chess', 'opening', 'lichess', 'chessable', 'chesstempo', 'database', 'pgn', 'stockfish', 'analysis board', 'repertoire'],
      domains: ['chess.com', 'lichess.org', 'chessable.com', 'chesstempo.com', 'chessgames.com']
    },
    {
      folder: 'Gaming',
      icon: '🎮',
      terms: ['steam', 'path of exile', 'poe', 'poe2', 'league', 'dota', 'valorant', 'tekken', 'street fighter', 'build guide', 'game', 'gaming', 'wiki', 'patch notes', 'maxroll', 'mobalytics', 'op.gg'],
      domains: ['steampowered.com', 'steamcommunity.com', 'pathofexile.com', 'maxroll.gg', 'poe.ninja', 'mobalytics.gg', 'op.gg', 'u.gg', 'mobafire.com']
    },
    {
      folder: 'AI Tools',
      icon: '🤖',
      terms: ['chatgpt', 'openai', 'claude', 'anthropic', 'deepseek', 'gemini', 'perplexity', 'llm', 'ai', 'prompt', 'cursor', 'windsurf'],
      domains: ['chatgpt.com', 'openai.com', 'anthropic.com', 'claude.ai', 'deepseek.com', 'perplexity.ai', 'gemini.google.com', 'cursor.com']
    },
    {
      folder: 'Work & Schedule',
      icon: '🧭',
      terms: ['work', 'schedule', 'shift', 'table game', 'table games', 'payroll', 'employee', 'hr', 'benefits', 'ukg', 'workday', 'kronos', 'dealer', 'casino'],
      domains: ['workday.com', 'ukg.com', 'ultipro.com']
    },
    {
      folder: 'Money & Business',
      icon: '💳',
      terms: ['stripe', 'paypal', 'bank', 'invoice', 'dashboard', 'console', 'analytics', 'domain', 'godaddy', 'cloudflare', 'adsense', 'search console', 'merchant', 'billing', 'tax'],
      domains: ['stripe.com', 'paypal.com', 'godaddy.com', 'cloudflare.com', 'analytics.google.com', 'search.google.com']
    },
    {
      folder: 'Learning & Research',
      icon: '📚',
      terms: ['guide', 'tutorial', 'course', 'learn', 'research', 'paper', 'article', 'manual', 'reference', 'lesson', 'documentation', 'book', 'wiki'],
      domains: ['wikipedia.org', 'coursera.org', 'udemy.com', 'khanacademy.org', 'arxiv.org']
    },
    {
      folder: 'Shopping & Food',
      icon: '🛒',
      terms: ['amazon', 'ebay', 'etsy', 'walmart', 'target', 'doordash', 'ubereats', 'shop', 'cart', 'order', 'delivery', 'restaurant', 'food'],
      domains: ['amazon.com', 'ebay.com', 'etsy.com', 'walmart.com', 'target.com', 'doordash.com', 'ubereats.com']
    },
    {
      folder: 'Media & Video',
      icon: '🎬',
      terms: ['youtube', 'twitch', 'netflix', 'hulu', 'spotify', 'movie', 'anime', 'video', 'watch', 'music', 'podcast', 'stream'],
      domains: ['youtube.com', 'youtu.be', 'twitch.tv', 'netflix.com', 'hulu.com', 'spotify.com', 'crunchyroll.com']
    },
    {
      folder: 'Social & Community',
      icon: '💬',
      terms: ['reddit', 'discord', 'twitter', 'x.com', 'facebook', 'instagram', 'forum', 'community', 'comment', 'social'],
      domains: ['reddit.com', 'discord.com', 'discord.gg', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com']
    },
    {
      folder: 'Personal & Utilities',
      icon: '🧰',
      terms: ['mail', 'gmail', 'yahoo', 'maps', 'calendar', 'drive', 'docs', 'translate', 'weather', 'account', 'login', 'settings'],
      domains: ['mail.google.com', 'gmail.com', 'mail.yahoo.com', 'calendar.google.com', 'drive.google.com', 'docs.google.com', 'maps.google.com']
    }
  ];

  const NSFW_RULES = {
    domains: [
      'onlyfans.com', 'fansly.com', 'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com', 'youporn.com', 'chaturbate.com', 'stripchat.com', 'spankbang.com', 'brazzers.com', 'rule34.xxx', 'e621.net', 'nhentai.net', 'gelbooru.com', 'danbooru.donmai.us'
    ],
    patterns: [
      /(^|[^a-z])nsfw([^a-z]|$)/i,
      /(^|[^a-z])xxx([^a-z]|$)/i,
      /(^|[^a-z])porn([^a-z]|$)/i,
      /(^|[^a-z])adult([^a-z]|$)/i,
      /(^|[^a-z])hentai([^a-z]|$)/i,
      /(^|[^a-z])camgirl([^a-z]|$)/i,
      /(^|[^a-z])nude([^a-z]|$)/i,
      /(^|[^a-z])erotic([^a-z]|$)/i,
      /(^|[^a-z])rule34([^a-z]|$)/i,
      /(^|[^a-z])onlyfans([^a-z]|$)/i,
      /(^|[^a-z])fansly([^a-z]|$)/i
    ]
  };

  function callApi(namespace, method, ...args) {
    return new Promise((resolve, reject) => {
      try {
        let target = chrome?.[namespace];
        let fn = target?.[method];
        let callArgs = args;

        if (namespace === 'storage' && method === 'local') {
          target = chrome?.storage?.local;
          const firstArg = args[0];
          const storageMethod = firstArg && typeof firstArg === 'object' && !Array.isArray(firstArg) ? 'set' : 'get';
          fn = target?.[storageMethod];
          callArgs = [firstArg];
        }

        if (typeof fn !== 'function') {
          reject(new Error(`Chrome API chrome.${namespace}.${method} is not available.`));
          return;
        }

        fn.call(target, ...callArgs, (result) => {
          const err = chrome.runtime.lastError;
          if (err) reject(new Error(err.message));
          else resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async function getSettings() {
    const stored = await callApi('storage', 'local', ['bookmarkFogSettings']);
    return { ...DEFAULT_SETTINGS, ...(stored.bookmarkFogSettings || {}) };
  }

  async function saveSettings(settings) {
    await callApi('storage', 'local', { bookmarkFogSettings: { ...DEFAULT_SETTINGS, ...settings } });
  }

  async function getTree() {
    return callApi('bookmarks', 'getTree');
  }

  function stripWww(hostname) {
    return (hostname || '').replace(/^www\./i, '').toLowerCase();
  }

  function getHostname(url) {
    try {
      return stripWww(new URL(url).hostname);
    } catch (_) {
      return '';
    }
  }

  function normalizeUrl(url) {
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      parsed.hostname = stripWww(parsed.hostname);
      let text = parsed.toString().toLowerCase();
      if (text.endsWith('/')) text = text.slice(0, -1);
      return text;
    } catch (_) {
      return String(url || '').trim().toLowerCase();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function findRoots(tree) {
    const root = tree[0];
    const children = root.children || [];
    const bookmarksBar = children.find((node) => /bookmarks bar|favorites bar/i.test(node.title)) || children[0] || null;
    const otherBookmarks = children.find((node) => /other bookmarks|bookmarks menu/i.test(node.title)) || children.find((node) => node.id !== bookmarksBar?.id) || bookmarksBar || root;
    const mobileBookmarks = children.find((node) => /mobile bookmarks/i.test(node.title)) || null;
    return { root, bookmarksBar, otherBookmarks, mobileBookmarks };
  }

  function isManagedFolderTitle(title, settings = DEFAULT_SETTINGS) {
    const managedNames = [
      settings.rootFolderName || DEFAULT_SETTINGS.rootFolderName,
      settings.quarantineFolderName || DEFAULT_SETTINGS.quarantineFolderName,
      settings.duplicateFolderName || DEFAULT_SETTINGS.duplicateFolderName,
      settings.restoreFolderName || DEFAULT_SETTINGS.restoreFolderName
    ];
    return managedNames.includes(title);
  }

  function isCategoryFolderTitle(title) {
    const categoryNames = CATEGORY_RULES.map((rule) => safeFolderName(rule.folder));
    categoryNames.push(safeFolderName('Archive / Unsorted'), safeFolderName('Possible NSFW'));
    return categoryNames.includes(safeFolderName(title));
  }

  function isOrganizeCategoryFolder(node, path, settings = DEFAULT_SETTINGS) {
    const parentParts = path.filter(Boolean);
    const parentTitle = parentParts[parentParts.length - 1] || '';
    return parentTitle === (settings.rootFolderName || DEFAULT_SETTINGS.rootFolderName) && isCategoryFolderTitle(node.title);
  }

  function flattenTree(tree, settings = DEFAULT_SETTINGS) {
    const roots = findRoots(tree);
    const protectedRootIds = new Set();
    const topBarLimit = Math.max(0, Number(settings.protectTopBarLimit ?? DEFAULT_SETTINGS.protectTopBarLimit) || 0);
    const bookmarksBarChildren = roots.bookmarksBar?.children || [];
    const rootContainerIds = new Set([roots.bookmarksBar?.id, roots.otherBookmarks?.id, roots.mobileBookmarks?.id].filter(Boolean).map(String));

    if (settings.protectBookmarksBar && roots.bookmarksBar) {
      bookmarksBarChildren
        .filter((child) => !isManagedFolderTitle(child.title, settings))
        .slice(0, topBarLimit)
        .forEach((child) => protectedRootIds.add(child.id));
    }

    const bookmarks = [];
    const folders = [];
    const protectedBarItems = settings.protectBookmarksBar
      ? bookmarksBarChildren
          .filter((child) => protectedRootIds.has(child.id))
          .map((child) => ({
            id: child.id,
            title: child.title || child.url || 'Untitled',
            url: child.url || '',
            isFolder: !child.url,
            index: child.index
          }))
      : [];

    function walk(node, path, rootTitle, rootId, isProtected, ancestorFolderIds = [], ancestorFolderTitles = [], insideManagedFolder = false) {
      const nextPath = node.title ? [...path, node.title] : [...path];
      const protectedNow = isProtected || protectedRootIds.has(node.id);
      const isFolderNode = !node.url;
      const isManagedFolder = isFolderNode && isManagedFolderTitle(node.title, settings);
      const isCategoryFolder = isFolderNode && isOrganizeCategoryFolder(node, path, settings);
      const managedNow = insideManagedFolder || isManagedFolder;
      const directParentIsRoot = rootContainerIds.has(String(node.parentId));
      const isInsideExistingFolder = ancestorFolderIds.length > 0;

      if (node.url) {
        const hostname = getHostname(node.url);
        bookmarks.push({
          id: node.id,
          parentId: node.parentId,
          index: node.index,
          title: node.title || hostname || node.url,
          url: node.url,
          hostname,
          dateAdded: node.dateAdded || null,
          path: path.filter(Boolean).join(' / '),
          rootTitle,
          rootId,
          isProtected: protectedNow,
          directParentIsRoot,
          isInsideExistingFolder,
          isInsideManagedFolder: insideManagedFolder,
          ancestorFolderIds: [...ancestorFolderIds],
          ancestorFolderTitles: [...ancestorFolderTitles]
        });
        return;
      }

      if (node.id !== roots.root.id) {
        folders.push({
          id: node.id,
          parentId: node.parentId,
          index: node.index,
          title: node.title || 'Untitled folder',
          dateAdded: node.dateAdded || null,
          path: path.filter(Boolean).join(' / '),
          rootTitle,
          rootId,
          isProtected: protectedNow,
          isManagedFolder,
          isOrganizeCategoryFolder: isCategoryFolder,
          isRootContainer: rootContainerIds.has(String(node.id)),
          isInsideManagedFolder: insideManagedFolder,
          isNestedInExistingFolder: ancestorFolderIds.length > 0,
          directParentIsRoot,
          ancestorFolderIds: [...ancestorFolderIds],
          ancestorFolderTitles: [...ancestorFolderTitles],
          childCount: (node.children || []).length
        });
      }

      const shouldTrackAsExistingFolder = node.id !== roots.root.id && !rootContainerIds.has(String(node.id)) && !isManagedFolder && !isCategoryFolder;
      const nextAncestorFolderIds = shouldTrackAsExistingFolder ? [...ancestorFolderIds, node.id] : ancestorFolderIds;
      const nextAncestorFolderTitles = shouldTrackAsExistingFolder ? [...ancestorFolderTitles, node.title || 'Untitled folder'] : ancestorFolderTitles;

      (node.children || []).forEach((child) => walk(child, nextPath, rootTitle || node.title || '', rootId || node.id, protectedNow, nextAncestorFolderIds, nextAncestorFolderTitles, managedNow));
    }

    (roots.root.children || []).forEach((child) => {
      if (!settings.includeMobileBookmarks && roots.mobileBookmarks && child.id === roots.mobileBookmarks.id) return;
      walk(child, [], child.title || '', child.id, protectedRootIds.has(child.id));
    });

    return { roots, bookmarks, folders, protectedBarItems };
  }

  function detectNsfw(bookmark) {
    const host = bookmark.hostname || getHostname(bookmark.url);
    const haystack = `${bookmark.title || ''} ${bookmark.url || ''} ${bookmark.path || ''}`.toLowerCase();
    const domainHit = NSFW_RULES.domains.find((domain) => host === domain || host.endsWith(`.${domain}`) || host.includes(domain));
    if (domainHit) {
      return { flag: true, confidence: 0.98, reason: `Domain match: ${domainHit}` };
    }
    const patternHit = NSFW_RULES.patterns.find((pattern) => pattern.test(haystack));
    if (patternHit) {
      return { flag: true, confidence: 0.84, reason: 'Adult keyword pattern matched' };
    }
    return { flag: false, confidence: 0, reason: '' };
  }

  function classifyBookmark(bookmark) {
    const nsfw = detectNsfw(bookmark);
    if (nsfw.flag) {
      return {
        folder: 'Possible NSFW',
        icon: '🔞',
        confidence: nsfw.confidence,
        reason: nsfw.reason,
        isNsfw: true
      };
    }

    const host = bookmark.hostname || getHostname(bookmark.url);
    const text = `${bookmark.title || ''} ${bookmark.url || ''} ${bookmark.path || ''} ${host}`.toLowerCase();
    let best = {
      folder: 'Archive / Unsorted',
      icon: '🗂️',
      confidence: 0.32,
      reason: 'No strong match',
      isNsfw: false
    };

    CATEGORY_RULES.forEach((rule) => {
      let score = 0;
      const hits = [];
      rule.domains.forEach((domain) => {
        if (host === domain || host.endsWith(`.${domain}`)) {
          score += 7;
          hits.push(domain);
        }
      });
      rule.terms.forEach((term) => {
        if (text.includes(term.toLowerCase())) {
          score += term.length > 6 ? 3 : 2;
          if (hits.length < 3) hits.push(term);
        }
      });
      if (score > 0) {
        const confidence = Math.min(0.96, 0.42 + score / 18);
        if (confidence > best.confidence) {
          best = {
            folder: rule.folder,
            icon: rule.icon,
            confidence,
            reason: hits.length ? `Matched ${hits.slice(0, 3).join(', ')}` : `Matched ${rule.folder}`,
            isNsfw: false
          };
        }
      }
    });

    return best;
  }

  function classifyFolder(folder, flat) {
    const childBookmarks = flat.bookmarks.filter((bookmark) => (bookmark.ancestorFolderIds || []).includes(folder.id));
    const scores = new Map();

    childBookmarks.forEach((bookmark) => {
      const classification = classifyBookmark(bookmark);
      if (classification.isNsfw || classification.folder === 'Archive / Unsorted') return;
      const current = scores.get(classification.folder) || { ...classification, score: 0, count: 0 };
      current.score += classification.confidence || 0.4;
      current.count += 1;
      scores.set(classification.folder, current);
    });

    let best = null;
    scores.forEach((entry) => {
      if (!best || entry.score > best.score) best = entry;
    });

    if (!best) {
      return {
        folder: 'Archive / Unsorted',
        icon: '🗂️',
        confidence: 0.34,
        reason: 'Folder contents had no strong match',
        isNsfw: false
      };
    }

    return {
      folder: best.folder,
      icon: best.icon || '📁',
      confidence: Math.min(0.96, 0.5 + best.score / Math.max(4, childBookmarks.length * 1.4)),
      reason: `Folder content matched ${best.folder} (${best.count} item${best.count === 1 ? '' : 's'})`,
      isNsfw: false
    };
  }

  function buildDuplicateMap(bookmarks) {
    const map = new Map();
    bookmarks.forEach((bookmark) => {
      if (bookmark.isProtected) return;
      const key = normalizeUrl(bookmark.url);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(bookmark);
    });

    const duplicateIds = new Set();
    const groups = [];
    map.forEach((items, key) => {
      if (items.length < 2) return;
      const sorted = [...items].sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
      const keep = sorted[0];
      const remove = sorted.slice(1);
      remove.forEach((item) => duplicateIds.add(item.id));
      groups.push({ key, keep, remove, count: items.length });
    });
    return { duplicateIds, groups };
  }

  function expectedOrganizeRootId(flat, settings = DEFAULT_SETTINGS) {
    const destination = settings.organizeDestination || DEFAULT_SETTINGS.organizeDestination;
    if (destination === 'bookmarksBar') return flat.roots.bookmarksBar?.id || flat.roots.otherBookmarks?.id || flat.roots.root?.id;
    return flat.roots.otherBookmarks?.id || flat.roots.bookmarksBar?.id || flat.roots.root?.id;
  }

  function isAlreadyOrganized(bookmark, classification, flat, settings = DEFAULT_SETTINGS) {
    if (!bookmark || !classification || classification.isNsfw) return false;
    const expectedRootId = expectedOrganizeRootId(flat, settings);
    if (expectedRootId && String(bookmark.rootId) !== String(expectedRootId)) return false;
    const parts = String(bookmark.path || '').split(' / ').filter(Boolean);
    const rootIndex = parts.indexOf(settings.rootFolderName || DEFAULT_SETTINGS.rootFolderName);
    if (rootIndex === -1) return false;
    return parts[rootIndex + 1] === safeFolderName(classification.folder);
  }

  function isAlreadyOrganizedFolder(folder, classification, flat, settings = DEFAULT_SETTINGS) {
    if (!folder || !classification || classification.isNsfw) return false;
    const expectedRootId = expectedOrganizeRootId(flat, settings);
    if (expectedRootId && String(folder.rootId) !== String(expectedRootId)) return false;
    const parts = String(folder.path || '').split(' / ').filter(Boolean);
    const rootIndex = parts.indexOf(settings.rootFolderName || DEFAULT_SETTINGS.rootFolderName);
    if (rootIndex === -1) return false;
    return parts[rootIndex + 1] === safeFolderName(classification.folder);
  }

  function analyzeFlattened(flat, settings = DEFAULT_SETTINGS) {
    const keepFoldersTogether = settings.keepExistingFoldersTogether !== false;
    const duplicateData = buildDuplicateMap(flat.bookmarks);
    const bookmarkSuggestions = flat.bookmarks.map((bookmark) => {
      const classification = classifyBookmark(bookmark);
      const isDuplicate = duplicateData.duplicateIds.has(bookmark.id);
      const alreadyOrganized = isAlreadyOrganized(bookmark, classification, flat, settings);
      const actionType = bookmark.isProtected
        ? 'protected'
        : classification.isNsfw
          ? 'nsfw'
          : isDuplicate
            ? 'duplicate'
            : alreadyOrganized
              ? 'organized'
              : keepFoldersTogether && bookmark.isInsideExistingFolder
                ? 'foldered'
                : 'organize';
      return {
        ...bookmark,
        ...classification,
        itemKind: 'bookmark',
        isDuplicate,
        isAlreadyOrganized: alreadyOrganized,
        actionType
      };
    });

    const folderMoveSuggestions = keepFoldersTogether
      ? flat.folders
          .filter((folder) => !folder.isProtected && !folder.isRootContainer && !folder.isManagedFolder && !folder.isInsideManagedFolder && !folder.isNestedInExistingFolder && folder.childCount > 0 && folder.parentId)
          .map((folder) => {
            const classification = classifyFolder(folder, flat);
            const alreadyOrganized = isAlreadyOrganizedFolder(folder, classification, flat, settings);
            return {
              ...folder,
              ...classification,
              itemKind: 'folderMove',
              url: '',
              hostname: 'Folder',
              isDuplicate: false,
              isNsfw: false,
              isAlreadyOrganized: alreadyOrganized,
              actionType: alreadyOrganized ? 'organized' : 'organize'
            };
          })
      : [];

    const suggestions = [...folderMoveSuggestions, ...bookmarkSuggestions];
    const emptyFolders = flat.folders.filter((folder) => !folder.isProtected && folder.childCount === 0 && folder.parentId);
    const categoryCounts = suggestions.reduce((acc, item) => {
      if (item.actionType !== 'organize') return acc;
      acc[item.folder] = (acc[item.folder] || 0) + 1;
      return acc;
    }, {});

    return {
      ...flat,
      suggestions,
      bookmarkSuggestions,
      folderMoveSuggestions,
      nsfw: suggestions.filter((item) => item.isNsfw && !item.isProtected),
      duplicates: duplicateData.groups,
      duplicateIds: duplicateData.duplicateIds,
      emptyFolders,
      categoryCounts,
      stats: {
        totalBookmarks: flat.bookmarks.length,
        workableBookmarks: suggestions.filter((item) => !item.isProtected).length,
        protectedBookmarks: suggestions.filter((item) => item.isProtected).length,
        protectedBarItems: flat.protectedBarItems.length,
        suggestedMoves: suggestions.filter((item) => item.actionType === 'organize').length,
        folderMoves: suggestions.filter((item) => item.itemKind === 'folderMove' && item.actionType === 'organize').length,
        folderedBookmarks: suggestions.filter((item) => item.actionType === 'foldered').length,
        organizedCount: suggestions.filter((item) => item.actionType === 'organized').length,
        nsfwCount: suggestions.filter((item) => item.actionType === 'nsfw').length,
        duplicateCount: suggestions.filter((item) => item.actionType === 'duplicate').length,
        emptyFolderCount: emptyFolders.length
      }
    };
  }

  async function analyzeBookmarks(settingsOverride = null) {
    const settings = settingsOverride || await getSettings();
    const tree = await getTree();
    const flat = flattenTree(tree, settings);
    const analysis = analyzeFlattened(flat, settings);
    await callApi('storage', 'local', {
      bookmarkFogLastScan: {
        scannedAt: new Date().toISOString(),
        stats: analysis.stats
      }
    });
    return { settings, tree, analysis };
  }

  async function downloadText(filename, content, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      chrome.downloads.download({ url, filename, saveAs: true }, (downloadId) => {
        const err = chrome.runtime.lastError;
        setTimeout(() => URL.revokeObjectURL(url), 2500);
        if (err) reject(new Error(err.message));
        else resolve(downloadId);
      });
    });
  }

  function timestampForFile() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  async function exportJsonBackup(reason = 'manual') {
    const tree = await getTree();
    const payload = {
      schema: 'bookmarkfog-backup-v1',
      createdAt: new Date().toISOString(),
      reason,
      note: 'Created by BookmarkFog. Use the dashboard restore tool to recreate this backup inside a safe restore folder.',
      tree
    };
    const filename = `BookmarkFog/bookmarkfog-backup-${reason}-${timestampForFile()}.json`;
    await downloadText(filename, JSON.stringify(payload, null, 2), 'application/json');
    return payload;
  }

  function nodeToBookmarkHtml(node, depth = 1) {
    const pad = '    '.repeat(depth);
    const title = escapeHtml(node.title || node.url || 'Untitled');
    const addDate = node.dateAdded ? Math.floor(node.dateAdded / 1000) : Math.floor(Date.now() / 1000);
    if (node.url) {
      return `${pad}<DT><A HREF="${escapeHtml(node.url)}" ADD_DATE="${addDate}">${title}</A>\n`;
    }
    const children = (node.children || []).map((child) => nodeToBookmarkHtml(child, depth + 1)).join('');
    return `${pad}<DT><H3 ADD_DATE="${addDate}">${title}</H3>\n${pad}<DL><p>\n${children}${pad}</DL><p>\n`;
  }

  async function exportHtmlBackup(reason = 'manual') {
    const tree = await getTree();
    const rootChildren = (tree[0]?.children || []).map((child) => nodeToBookmarkHtml(child, 1)).join('');
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n${rootChildren}</DL><p>\n`;
    const filename = `BookmarkFog/bookmarkfog-backup-${reason}-${timestampForFile()}.html`;
    await downloadText(filename, html, 'text/html');
  }

  async function getChildren(parentId) {
    return callApi('bookmarks', 'getChildren', parentId);
  }

  async function createBookmark(details) {
    return callApi('bookmarks', 'create', details);
  }

  async function moveBookmark(id, details) {
    return callApi('bookmarks', 'move', id, details);
  }

  async function removeTree(id) {
    return callApi('bookmarks', 'removeTree', id);
  }

  async function removeBookmark(id) {
    return callApi('bookmarks', 'remove', id);
  }

  async function ensureFolder(parentId, title) {
    const children = await getChildren(parentId);
    const existing = children.find((child) => !child.url && child.title === title);
    if (existing) return existing;
    return createBookmark({ parentId, title });
  }

  async function ensureFolderPath(parentId, parts) {
    let currentId = parentId;
    let current = null;
    for (const part of parts.filter(Boolean)) {
      current = await ensureFolder(currentId, part);
      currentId = current.id;
    }
    return current;
  }

  function safeFolderName(name) {
    return String(name || 'Unsorted').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Unsorted';
  }

  async function destinationRoot(settings, purpose = 'organize') {
    const tree = await getTree();
    const roots = findRoots(tree);
    const destination = settings.organizeDestination || DEFAULT_SETTINGS.organizeDestination;

    if (purpose === 'organize' && destination === 'bookmarksBar') {
      return roots.bookmarksBar || roots.otherBookmarks || roots.root;
    }

    return roots.otherBookmarks || roots.bookmarksBar || roots.root;
  }

  async function backupIfNeeded(settings, reason) {
    if (settings.autoBackupBeforeChanges) await exportJsonBackup(reason);
  }

  async function organizeBookmarks(items, settings) {
    await backupIfNeeded(settings, 'before-organize');
    const root = await destinationRoot(settings, 'organize');
    const operations = [];

    for (const item of items) {
      if (item.isProtected || item.isNsfw || item.isDuplicate || item.isAlreadyOrganized || !item.id) continue;
      if (!item.url && item.itemKind !== 'folderMove') continue;
      const dest = await ensureFolderPath(root.id, [settings.rootFolderName, safeFolderName(item.folder)]);
      if (String(item.parentId) === String(dest.id) || String(item.id) === String(dest.id)) continue;
      try {
        await moveBookmark(item.id, { parentId: dest.id });
        operations.push({ type: 'move', id: item.id, title: item.title, url: item.url || '', fromParentId: item.parentId, fromIndex: item.index, toParentId: dest.id, at: new Date().toISOString() });
      } catch (error) {
        operations.push({ type: 'error', id: item.id, title: item.title, error: error.message });
      }
    }

    await saveOperations(operations);
    return operations;
  }

  async function quarantineBookmarks(items, settings, reason = 'Review') {
    await backupIfNeeded(settings, 'before-quarantine');
    const root = await destinationRoot(settings, 'safeStorage');
    const dateName = new Date().toISOString().slice(0, 10);
    const dest = await ensureFolderPath(root.id, [settings.quarantineFolderName, `${reason} ${dateName}`]);
    const operations = [];

    for (const item of items) {
      if (item.isProtected || !item.id || !item.url) continue;
      try {
        await moveBookmark(item.id, { parentId: dest.id });
        operations.push({ type: 'move', id: item.id, title: item.title, url: item.url, fromParentId: item.parentId, fromIndex: item.index, toParentId: dest.id, at: new Date().toISOString() });
      } catch (error) {
        operations.push({ type: 'error', id: item.id, title: item.title, error: error.message });
      }
    }

    await saveOperations(operations);
    return operations;
  }

  async function deleteBookmarks(items, settings) {
    await backupIfNeeded(settings, 'before-delete');
    const operations = [];
    for (const item of items) {
      if (item.isProtected || !item.id || !item.url) continue;
      try {
        await removeBookmark(item.id);
        operations.push({ type: 'delete', id: item.id, title: item.title, url: item.url, fromParentId: item.parentId, fromIndex: item.index, at: new Date().toISOString() });
      } catch (error) {
        operations.push({ type: 'error', id: item.id, title: item.title, error: error.message });
      }
    }
    await saveOperations(operations);
    return operations;
  }

  async function removeEmptyFolders(folders, settings) {
    await backupIfNeeded(settings, 'before-empty-folder-clean');
    const operations = [];
    for (const folder of folders) {
      if (folder.isProtected || !folder.id || folder.childCount !== 0) continue;
      try {
        await removeTree(folder.id);
        operations.push({ type: 'removeFolder', id: folder.id, title: folder.title, fromParentId: folder.parentId, at: new Date().toISOString() });
      } catch (error) {
        operations.push({ type: 'error', id: folder.id, title: folder.title, error: error.message });
      }
    }
    await saveOperations(operations);
    return operations;
  }

  async function saveOperations(operations) {
    await callApi('storage', 'local', { bookmarkFogLastOperations: operations });
  }

  async function getLastOperations() {
    const stored = await callApi('storage', 'local', ['bookmarkFogLastOperations']);
    return stored.bookmarkFogLastOperations || [];
  }

  async function undoLastMoves() {
    const operations = await getLastOperations();
    const undo = [];
    for (const op of [...operations].reverse()) {
      if (op.type !== 'move' || !op.fromParentId) continue;
      try {
        await moveBookmark(op.id, { parentId: op.fromParentId, index: op.fromIndex });
        undo.push({ ...op, undone: true });
      } catch (error) {
        undo.push({ ...op, undoError: error.message });
      }
    }
    await callApi('storage', 'local', { bookmarkFogLastOperations: [] });
    return undo;
  }

  async function restoreBackupAsFolder(backupPayload) {
    const tree = Array.isArray(backupPayload) ? backupPayload : backupPayload.tree;
    if (!Array.isArray(tree) || !tree[0]) throw new Error('This does not look like a BookmarkFog JSON backup.');

    const settings = await getSettings();
    const root = await destinationRoot(settings, 'safeStorage');
    const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ').replaceAll(':', '-');
    const restoreRoot = await ensureFolderPath(root.id, [settings.restoreFolderName, stamp]);

    async function cloneNode(node, parentId) {
      if (node.url) {
        await createBookmark({ parentId, title: node.title || node.url, url: node.url });
        return;
      }
      const folderTitle = node.title || 'Root';
      const folder = await createBookmark({ parentId, title: folderTitle });
      for (const child of node.children || []) {
        await cloneNode(child, folder.id);
      }
    }

    for (const top of tree[0].children || []) {
      await cloneNode(top, restoreRoot.id);
    }
    return restoreRoot;
  }

  function formatDate(ms) {
    if (!ms) return 'Unknown';
    try {
      return new Date(ms).toLocaleDateString();
    } catch (_) {
      return 'Unknown';
    }
  }

  window.BookmarkFogCore = {
    DEFAULT_SETTINGS,
    CATEGORY_RULES,
    getSettings,
    saveSettings,
    getTree,
    findRoots,
    flattenTree,
    expectedOrganizeRootId,
    analyzeBookmarks,
    classifyBookmark,
    classifyFolder,
    detectNsfw,
    normalizeUrl,
    exportJsonBackup,
    exportHtmlBackup,
    organizeBookmarks,
    quarantineBookmarks,
    deleteBookmarks,
    removeEmptyFolders,
    undoLastMoves,
    restoreBackupAsFolder,
    getLastOperations,
    formatDate,
    escapeHtml
  };
})();
