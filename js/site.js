/* =============================================================
 * 01. Мобільна навігація
 * ============================================================= */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

/* =============================================================
 * 02. Дані та безпечне відображення тексту
 * Каталог генерує build_catalog.py з content.json кожної папки.
 * ============================================================= */
const data = window.SITE_CONTENT || { jobs: [], posts: [] };
const settings = window.SITE_SETTINGS || { cimicEnabled: false };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
/* =============================================================
 * 02a. Перенесення рядків у тексті з JSON
 * ============================================================= */
const formatText = value => esc(value)
  .replace(/\r\n?/g, '\n')
  .replace(/\n/g, '<br>');
const fill = (id, html) => {
  const target = document.getElementById(id);
  if (target) target.innerHTML = html;
  
};


/* =============================================================
 * 03. Фото: якщо немає cover, не створюємо жодного фотоблоку.
 * При помилці завантаження блок прибирається разом із відступом.
 * ============================================================= */
const coverHtml = (item, alt) => item.cover
  ? `<div class="card-cover"><img src="${esc(item.cover)}" alt="${esc(alt)}" loading="lazy" onerror="this.closest('.card').classList.remove('has-cover');this.parentElement.remove()"></div>`
  : '';
const galleryHtml = item => Array.isArray(item.gallery) && item.gallery.length
  ? `<div class="detail-gallery">${item.gallery.map((src, i) => `<figure><img src="${esc(src)}" alt="Фото ${i + 1}" loading="lazy" onerror="const gallery=this.closest('.detail-gallery');this.parentElement.remove();if(gallery && !gallery.querySelector('figure'))gallery.remove()"></figure>`).join('')}</div>`
  : '';
const detailCoverHtml = item => item.cover
  ? `<figure class="detail-cover"><img src="${esc(item.cover)}" alt="${esc(item.title)}" onerror="this.parentElement.remove()"></figure>`
  : '';

/* =============================================================
 * 04. Картки вакансій і дайджесту
 * ============================================================= */
/* =============================================================
 * 04a. Статус вакансії: відкрита / закрита.
 * vacancyStatus не замінює status (example/draft), який відповідає
 * за демонстраційність або публікацію запису.
 * Для старих записів без vacancyStatus показуємо «УТОЧНЮЄТЬСЯ»,
 * щоб не стверджувати без перевірки, що набір відкритий.
 * ============================================================= */
const vacancyState = job => ['open', 'closed'].includes(job.vacancyStatus)
  ? job.vacancyStatus : 'unknown';
const vacancyBadge = job => {
  const state = vacancyState(job);
  const label = state === 'open' ? 'ВІДКРИТА' : state === 'closed' ? 'ЗАКРИТА' : 'УТОЧНЮЄТЬСЯ';
  return `<span class="vacancy-status is-${state}">${label}</span>`;
};
const sortedJobs = [...data.jobs].sort((a, b) => {
  const rank = { open: 0, unknown: 1, closed: 2 };
  return rank[vacancyState(a)] - rank[vacancyState(b)];
});
const jobCard = j => `<article class="card${j.cover ? ' has-cover' : ''}">
  ${coverHtml(j, j.title)}
  <div class="card-content"><div class="card-meta">${esc(j.category)} ${vacancyBadge(j)}</div>
  <h3>${esc(j.title)}</h3><p>${esc(j.summary)}</p>
  <a class="text-link" href="vacancy.html?id=${encodeURIComponent(j.id)}">Про посаду ↗</a></div>
</article>`;
const postCard = p => `<article class="card news-card${p.cover ? ' has-cover' : ''}">
  ${coverHtml(p, p.title)}
  <div class="card-content"><div class="card-meta">${esc(p.category)} · ${esc(p.date)} <span>${p.status === 'demo' ? 'ПРИКЛАД' : ''}</span></div>
  <h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p>
  <a class="text-link" href="article.html?id=${encodeURIComponent(p.id)}">Читати ↗</a></div>
</article>`;
fill('home-jobs', sortedJobs.filter(j => j.featured).slice(0, 4).map(jobCard).join(''));
fill('all-jobs', sortedJobs.map(jobCard).join(''));
fill('home-posts', data.posts.filter(p => p.featured).slice(0, 3).map(postCard).join(''));
fill('all-posts', [...data.posts].sort((a, b) => b.date.localeCompare(a.date)).map(postCard).join(''));

/* =============================================================
 * 05. Детальні сторінки вакансії та статті
 * ============================================================= */
const id = new URLSearchParams(location.search).get('id');
const job = data.jobs.find(j => j.id === id);
const post = data.posts.find(p => p.id === id);
if (document.getElementById('job-detail')) {
  fill('job-detail', job ? `
    <p class="eyebrow">${esc(job.category)} ${vacancyBadge(job)}</p>
    <h1>${esc(job.title)}</h1><p class="lead">${esc(job.summary)}</p>
    ${detailCoverHtml(job)}<p>${formatText(job.details)}</p>${galleryHtml(job)}
    ${job.status === 'example' ? '<p class="notice">Статус вакансії не підтверджений!!! Деталі за телефоном</p>' : ''}
    ${vacancyState(job) === 'closed'
      ? '<p class="notice">Набір на цю посаду завершено. Перегляньте інші відкриті вакансії.</p><a class="btn gold" href="vacancies.html">Переглянути вакансії ↗</a>'
      : '<a class="btn gold" href="index.html#contacts">Дізнатися більше</a></a>'}
  ` : '<h1>Посаду не знайдено</h1><a href="vacancies.html">Усі вакансії</a>');
}
if (document.getElementById('article-detail')) {
  fill('article-detail', post ? `
    <p class="eyebrow">${esc(post.category)} · ${esc(post.date)}${post.status === 'demo' ? ' · ДЕМО' : ''}</p>
    <h1>${esc(post.title)}</h1><p class="lead">${esc(post.excerpt)}</p>
    ${detailCoverHtml(post)}
    ${(Array.isArray(post.body) ? post.body : []).map(line => `<p>${esc(line)}</p>`).join('')}
    ${galleryHtml(post)}
    ${post.status === 'demo' ? '<p class="notice">Це демонстрація.</p>' : ''}
  ` : '<h1>Публікацію не знайдено</h1><a href="digest.html">Усі публікації</a>');
}

/* =============================================================
 * 06. Прихований розділ ЦВС
 * Поки cimicEnabled=false, каталог і навігація не показуються.
 * ============================================================= */
if (document.getElementById('all-cimic')) {
  fill('all-cimic', settings.cimicEnabled
    ? '<p>Каталог готується до наповнення.</p>'
    : '<p>Розділ поки що недоступний.</p>');
}

/* =============================================================
 * 07. Історичні фото: без fetch(), працює з file://
 * ============================================================= */
const photos = Array.isArray(window.HISTORY_PHOTOS) ? window.HISTORY_PHOTOS : [];
document.querySelectorAll('.history-photo').forEach((slot, index) => {
  const name = photos[index] || 'ff.png';
  const image = document.createElement('img');
  image.loading = 'lazy';
  image.alt = 'Ілюстрація до історії 1 ОБМП';
  image.src = 'images/history/' + encodeURIComponent(name);
  image.onerror = () => {
    if (!image.src.endsWith('/ff.png')) {
      image.onerror = null;
      image.src = 'images/history/ff.png';
    } else image.remove();
  };
  slot.append(image);
});
