(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('links');
  const callbar = document.getElementById('callbar');
  const heroBg = document.getElementById('heroBg');
  const heroInner = document.getElementById('heroInner');
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // mobile menu
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // scroll-linked: solid nav, hero parallax + fade, call bar, split image parallax
  const splits = [...document.querySelectorAll('.split-img img')];
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const h = window.innerHeight;
    nav.classList.toggle('solid', y > 40);
    if (callbar) callbar.classList.toggle('show', y > h * 0.75);
    if (!reduce) {
      if (y < h * 1.2) {
        const p = Math.min(y / h, 1);
        heroBg.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
        heroInner.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${1 - p * 0.08})`;
        heroInner.style.opacity = String(1 - p * 1.3);
      }
      splits.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h) return;
        const t = (r.top + r.height / 2 - h / 2) / h; // -1..1
        img.style.transform = `translate3d(0, ${-7 + t * -10}%, 0)`;
      });
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // reversible reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  const items = [...document.querySelectorAll('#gallery .g')];
  let idx = 0;
  const show = (i) => {
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].dataset.src;
    lbImg.alt = items[idx].querySelector('img').alt;
  };
  items.forEach((b, i) => b.addEventListener('click', () => {
    show(i); lb.hidden = false; document.body.style.overflow = 'hidden';
  }));
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });

  // quote form -> opens a text message to the office with details filled in
  const form = document.getElementById('quoteForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const body = `Hi Tico's Roofing, I'd like a free quote.\nName: ${d.get('name')}\nPhone: ${d.get('phone')}\nAddress: ${d.get('address') || '-'}\nNeed: ${d.get('type')}\n${d.get('msg') ? 'Details: ' + d.get('msg') : ''}`;
    const sep = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent) ? '&' : '?';
    window.location.href = `sms:+19705661884${sep}body=${encodeURIComponent(body)}`;
  });
})();
