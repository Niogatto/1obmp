// 01. Кнопка мобільного меню та посилання навігації.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

// 02. Закриття меню та оновлення атрибутів доступності.
function closeMenu() {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Відкрити меню');
}

// 03. Перемикання меню на мобільних екранах.
toggle.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(opened));
  toggle.setAttribute('aria-label', opened ? 'Закрити меню' : 'Відкрити меню');
});

// 04. Закриття після вибору пункту, Escape або натискання поза меню.
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
