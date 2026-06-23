// ---- Gallery filter + lightbox ----
(function () {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  const figures = Array.from(gallery.querySelectorAll('figure'));
  const filters = Array.from(document.querySelectorAll('.filter'));

  // Filtering
  let current = 'all';
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      current = btn.dataset.filter;
      figures.forEach((f) => {
        f.hidden = !(current === 'all' || f.dataset.cat === current);
      });
    });
  });

  // Lightbox
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  let visible = [];
  let idx = 0;

  function open(fig) {
    visible = figures.filter((f) => !f.hidden);
    idx = visible.indexOf(fig);
    render();
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function render() {
    const f = visible[idx];
    lbImg.src = f.dataset.full;
    lbImg.alt = f.dataset.cap || '';
    lbCap.textContent = f.dataset.cap || '';
  }
  function close() { lb.classList.remove('is-open'); document.body.style.overflow = ''; }
  function step(d) { idx = (idx + d + visible.length) % visible.length; render(); }

  figures.forEach((f) => f.addEventListener('click', () => open(f)));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbNext').addEventListener('click', () => step(1));
  document.getElementById('lbPrev').addEventListener('click', () => step(-1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
})();
