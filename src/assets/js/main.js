// ---- Nav: solidify on scroll ----
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---- Mobile menu ----
const burger = document.getElementById('burger');
const menu = document.getElementById('mobileMenu');
if (burger && menu) {
  const toggle = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggle(false)));
}

// ---- Scroll reveal ----
const reveals = document.querySelectorAll('[data-reveal]');
if (reveals.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

// ---- Phone formatting helper ----
function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}
document.querySelectorAll('input[data-phone]').forEach((el) => {
  el.addEventListener('input', () => { el.value = formatPhone(el.value); });
});
