async function getSeries() {
  const { series = [] } = await chrome.storage.sync.get('series');
  return series;
}

async function setSeries(series) {
  await chrome.storage.sync.set({ series });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderList(series) {
  const list = document.getElementById('seriesList');
  const emptyMsg = document.getElementById('emptyMsg');

  list.querySelectorAll('.series-item').forEach(el => el.remove());

  if (series.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  series.forEach((s, idx) => {
    const item = document.createElement('div');
    item.className = 'series-item';
    item.innerHTML = `
      <span class="series-name${s.read ? ' read-done' : ''}">${escapeHtml(s.name)}</span>
      <button class="btn-read${s.read ? ' active' : ''}" data-idx="${idx}">
        ${s.read ? '✓ 読んだ' : '読んだ'}
      </button>
      <button class="btn-delete" data-idx="${idx}" title="削除">×</button>
    `;
    list.appendChild(item);
  });
}

async function init() {
  const series = await getSeries();
  renderList(series);

  document.getElementById('seriesList').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    const series = await getSeries();

    if (btn.classList.contains('btn-read')) {
      series[idx].read = !series[idx].read;
      await setSeries(series);
      renderList(series);
      showToast(series[idx].read ? '解除しました' : 'ブロックを再開');
    } else if (btn.classList.contains('btn-delete')) {
      const name = series[idx].name;
      series.splice(idx, 1);
      await setSeries(series);
      renderList(series);
      showToast(`"${name}" を削除`);
    }
  });

  document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('nameInput');
    const name = input.value.trim();
    if (!name) return;

    const series = await getSeries();
    if (series.some(s => s.name === name)) {
      showToast('すでに登録済みです');
      input.select();
      return;
    }

    series.push({ id: Date.now(), name, read: false });
    await setSeries(series);
    renderList(series);
    input.value = '';
    input.focus();
  });
}

init();
