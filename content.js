const OVERLAY_CLASS = 'sb-overlay';
const PROCESSED_ATTR = 'data-sb';

let seriesList = [];

async function loadSeries() {
  const { series = [] } = await chrome.storage.sync.get('series');
  seriesList = series;
}

function shouldBlock(text) {
  const lower = text.toLowerCase();
  return seriesList.some(s => !s.read && lower.includes(s.name.toLowerCase()));
}

function applyBlock(article) {
  if (article.querySelector('.' + OVERLAY_CLASS)) return;

  // position:relative をインラインで設定しないと overlay の inset:0 が効かない。
  // className は React が再レンダリング時に上書きするため inline style を使う。
  article.style.position = 'relative';

  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.innerHTML = `
    <span class="sb-label">ネタバレを検出</span>
    <button class="sb-reveal">表示する</button>
  `;
  overlay.querySelector('.sb-reveal').addEventListener('click', (e) => {
    e.stopPropagation();
    article.style.position = '';
    overlay.remove();
  });
  article.appendChild(overlay);
}

function processArticle(article) {
  if (article.hasAttribute(PROCESSED_ATTR)) return;
  article.setAttribute(PROCESSED_ATTR, '1');

  const textEl = article.querySelector('[data-testid="tweetText"]');
  if (!textEl) return;

  if (shouldBlock(textEl.textContent)) {
    applyBlock(article);
  }
}

function processAll() {
  document.querySelectorAll(`article:not([${PROCESSED_ATTR}])`).forEach(processArticle);
}

function resetAndReprocess() {
  document.querySelectorAll(`article[${PROCESSED_ATTR}]`).forEach(a => {
    a.removeAttribute(PROCESSED_ATTR);
    a.style.position = '';
    const overlay = a.querySelector('.' + OVERLAY_CLASS);
    if (overlay) overlay.remove();
  });
  processAll();
}

let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processAll, 150);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.series) {
    loadSeries().then(resetAndReprocess);
  }
});

loadSeries().then(() => {
  processAll();
  observer.observe(document.body, { childList: true, subtree: true });
});
