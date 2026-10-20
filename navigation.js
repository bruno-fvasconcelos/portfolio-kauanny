// Controle do menu; o layout e as transições permanecem em CSS.
const menuToggle = document.querySelector('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const menuBackdrop = document.querySelector('.menu-backdrop');
const menuLinks = [...sideMenu.querySelectorAll('a')];
const casesToggle = sideMenu.querySelector('.side-menu__cases-toggle');
const casesSubmenu = document.querySelector('#cases-submenu');

function setCasesOpen(open) {
  casesToggle.setAttribute('aria-expanded', String(open));
  casesSubmenu.hidden = !open;
}

casesToggle.addEventListener('click', () => setCasesOpen(casesToggle.getAttribute('aria-expanded') !== 'true'));

function setMenuOpen(open, restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
  sideMenu.inert = !open;
  document.body.classList.toggle('menu-open', open);
  if (restoreFocus) menuToggle.focus();
}

function updateMenuLocation() {
  let location = window.location.hash || '#inicio';
  if (location === '#panini-social-listening') location = '#case-panini';
  if (location === '#allp-canal-transmissao') location = '#case-allp-fit';
  if (['#cases', '#case-panini', '#case-mequi', '#case-allp-fit'].includes(location)) setCasesOpen(true);
  menuLinks.forEach(link => {
    if (link.hash === location) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

menuToggle.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
menuBackdrop.addEventListener('click', () => setMenuOpen(false, true));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false, true);
  }
});
let navigationFrame;

function cancelNavigationScroll() {
  cancelAnimationFrame(navigationFrame);
}

function scrollToSection(destination) {
  cancelNavigationScroll();
  const start = window.scrollY;
  const end = Math.max(0, Math.min(
    start + destination.getBoundingClientRect().top,
    document.documentElement.scrollHeight - window.innerHeight
  ));
  const distance = end - start;
  const duration = Math.min(1500, Math.max(700, Math.abs(distance) * .16));
  let started;

  function step(timestamp) {
    started ??= timestamp;
    const progress = Math.min((timestamp - started) / duration, 1);
    const eased = progress < .5
      ? 4 * progress ** 3
      : 1 - (-2 * progress + 2) ** 3 / 2;
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
    if (progress < 1) navigationFrame = requestAnimationFrame(step);
    else {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  }
  navigationFrame = requestAnimationFrame(step);
}

// A rolagem manual interrompe a animação, mantendo o controle com a pessoa.
window.addEventListener('wheel', cancelNavigationScroll, { passive: true });
window.addEventListener('touchstart', cancelNavigationScroll, { passive: true });
window.addEventListener('popstate', cancelNavigationScroll);
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', ' '].includes(event.key)) {
    cancelNavigationScroll();
  }
});

menuLinks.forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const destination = document.querySelector(link.hash);
  if (destination) {
    event.preventDefault();
    setMenuOpen(false);
    if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
    updateMenuLocation();
    scrollToSection(destination);
  }
}));
window.addEventListener('hashchange', updateMenuLocation);
updateMenuLocation();
