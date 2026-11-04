// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

function lockPageScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
}

hamburger.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('mobile-open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  lockPageScroll(isOpen);
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    lockPageScroll(false);
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(s => navObserver.observe(s));
}

// ---------------------------------------------------------------------------
// Photo gallery marquee
//
// Each row drifts continuously, speeds up while the page is being scrolled,
// glides to a stop on hover, and can be dragged/swiped (with a little
// momentum). Position is tracked in JS and only the *speed* is eased, so the
// strip never jumps. (The old version swapped the CSS animation-duration,
// which made the browser recalculate the position and leap ~400px.)
// ---------------------------------------------------------------------------
const gallery = document.getElementById('gallery');
// The strip shows small thumbnails; the lightbox loads the full-size photo
// from each cell's data-full only when it is opened.
const galleryPhotos = gallery
  ? [...gallery.querySelectorAll('.photo-cell')].map(cell => {
      const img = cell.querySelector('img');
      return { full: cell.dataset.full || img.getAttribute('src'), alt: img.alt };
    })
  : [];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (gallery && !prefersReducedMotion) initMarquee(gallery);

function initMarquee(root) {
  const BASE_SPEED = 40;     // px per second, normal drift
  const FAST_SPEED = 150;    // px per second while the page is scrolling
  const EASE_TIME = 0.45;    // seconds; how gently speed changes
  const MAX_FLING = 2000;    // px per second cap on swipe momentum
  const DRAG_THRESHOLD = 6;  // px moved before a press becomes a drag
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const rows = [...root.querySelectorAll('.marquee-row')].map(row => {
    const track = row.querySelector('.marquee-track');
    const originals = [...track.children];
    const dir = track.dataset.dir === 'right' ? 1 : -1;
    return { row, track, originals, dir, x: 0, vel: dir * BASE_SPEED, loop: 0, hovered: false, drag: null, suppressClick: false };
  }).filter(r => r.originals.length);

  if (!rows.length) return;
  root.classList.add('marquee-on');

  // Width of one full set of photos (including the gap after the last one),
  // and enough copies of the set to always fill the row while looping.
  function layout(r) {
    const first = r.originals[0];
    const last = r.originals[r.originals.length - 1];
    const gap = parseFloat(getComputedStyle(r.track).columnGap) || 0;
    r.loop = last.offsetLeft + last.offsetWidth + gap - first.offsetLeft;
    if (r.loop <= 0) return;

    const setsNeeded = 1 + Math.ceil(r.row.clientWidth / r.loop);
    let sets = r.track.children.length / r.originals.length;
    while (sets < setsNeeded) {
      r.originals.forEach(cell => {
        const copy = cell.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        r.track.appendChild(copy);
      });
      sets++;
    }
    // Right-moving rows start one set in, so there is content on the left.
    if (r.x === 0 && r.dir === 1) r.x = -r.loop;
    wrap(r);
    paint(r);
  }

  function wrap(r) {
    if (r.loop <= 0) return;
    r.x %= r.loop;              // keep x within (-loop, 0]
    if (r.x > 0) r.x -= r.loop;
  }

  function paint(r) {
    r.track.style.transform = `translate3d(${r.x.toFixed(2)}px, 0, 0)`;
  }

  rows.forEach(layout);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => rows.forEach(layout), 150);
  });

  // Speed up while the page scrolls, ease back afterwards.
  let pageScrolling = false;
  let scrollStopTimer = null;
  window.addEventListener('scroll', () => {
    pageScrolling = true;
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => { pageScrolling = false; }, 250);
  }, { passive: true });

  // Animation loop (paused while the gallery is off screen).
  let running = false;
  let lastTime = 0;

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp after tab switches
    lastTime = now;
    const blend = 1 - Math.exp(-dt / EASE_TIME);

    rows.forEach(r => {
      if (r.drag && r.drag.moved) return; // finger/mouse is moving it
      const target = r.hovered ? 0 : r.dir * (pageScrolling ? FAST_SPEED : BASE_SPEED);
      r.vel += (target - r.vel) * blend;
      r.x += r.vel * dt;
      wrap(r);
      paint(r);
    });
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries[0].isIntersecting ? start() : stop();
    }).observe(root);
  } else {
    start();
  }

  // Hover to pause, drag/swipe to scroll.
  rows.forEach(r => {
    const { row } = r;

    if (canHover) {
      row.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') r.hovered = true; });
      row.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') r.hovered = false; });
    }

    row.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      r.drag = { id: e.pointerId, startX: e.clientX, lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false };
    });

    row.addEventListener('pointermove', e => {
      const d = r.drag;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.lastX;
      if (!d.moved && Math.abs(e.clientX - d.startX) > DRAG_THRESHOLD) {
        d.moved = true;
        row.classList.add('is-dragging');
        try { row.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone */ }
      }
      if (d.moved) {
        r.x += dx;
        wrap(r);
        paint(r);
        const dtMs = e.timeStamp - d.lastT;
        if (dtMs > 0) d.v = 0.8 * (dx / dtMs) * 1000 + 0.2 * d.v;
      }
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
    });

    const endDrag = e => {
      const d = r.drag;
      if (!d || e.pointerId !== d.id) return;
      if (d.moved) {
        const heldStill = e.timeStamp - d.lastT > 100;
        r.vel = heldStill ? 0 : Math.max(-MAX_FLING, Math.min(MAX_FLING, d.v));
        row.classList.remove('is-dragging');
        // Swallow the click the browser fires right after a drag ends.
        r.suppressClick = true;
        setTimeout(() => { r.suppressClick = false; }, 0);
      }
      r.drag = null;
    };
    row.addEventListener('pointerup', endDrag);
    row.addEventListener('pointercancel', endDrag);

    row.addEventListener('click', e => {
      if (r.suppressClick) {
        e.stopPropagation();
        e.preventDefault();
        r.suppressClick = false;
      }
    }, true);

    row.addEventListener('dragstart', e => e.preventDefault());
  });
}

// Site modals (membership popups)
document.querySelectorAll('[data-modal-open]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = document.getElementById(btn.getAttribute('data-modal-open'));
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockPageScroll(true);
  });
});

function closeAllModals() {
  const open = document.querySelectorAll('.site-modal.active');
  if (!open.length) return;
  open.forEach(modal => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  });
  lockPageScroll(false);
}

document.querySelectorAll('.site-modal').forEach(modal => {
  modal.addEventListener('click', (e) => { if (e.target === modal) closeAllModals(); });
  modal.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeAllModals));
});

// Gallery lightbox (click a photo; arrows, keyboard or swipe to browse)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCount = document.getElementById('lightboxCount');
let lightboxIndex = 0;
let lightboxReturnFocus = null;

function showPhoto(index) {
  if (!galleryPhotos.length) return;
  lightboxIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[lightboxIndex];
  lightboxImg.classList.add('is-loading');
  lightboxImg.src = photo.full;
  if (lightboxImg.complete && lightboxImg.naturalWidth) lightboxImg.classList.remove('is-loading');
  lightboxImg.alt = photo.alt || `Gallery photo ${lightboxIndex + 1} of ${galleryPhotos.length}`;
  lightboxCount.textContent = `${lightboxIndex + 1} / ${galleryPhotos.length}`;

  // Fetch the neighbours in the background so next/previous feel instant.
  [1, -1].forEach(step => {
    const n = galleryPhotos[(lightboxIndex + step + galleryPhotos.length) % galleryPhotos.length];
    new Image().src = n.full;
  });
}
lightboxImg.addEventListener('load', () => lightboxImg.classList.remove('is-loading'));
lightboxImg.addEventListener('error', () => lightboxImg.classList.remove('is-loading'));

function openLightbox(index) {
  lightboxReturnFocus = document.activeElement;
  showPhoto(index);
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  lockPageScroll(true);
  lightboxClose.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightbox.classList.contains('active')) return;
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.removeAttribute('src');
  lockPageScroll(false);
  if (lightboxReturnFocus && lightboxReturnFocus.focus) lightboxReturnFocus.focus({ preventScroll: true });
}

if (gallery) {
  gallery.addEventListener('click', e => {
    const cell = e.target.closest('.photo-cell');
    if (!cell) return;
    const full = cell.dataset.full || cell.querySelector('img').getAttribute('src');
    const index = galleryPhotos.findIndex(p => p.full === full);
    openLightbox(index < 0 ? 0 : index);
  });
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showPhoto(lightboxIndex - 1));
lightboxNext.addEventListener('click', () => showPhoto(lightboxIndex + 1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

// Swipe left/right inside the lightbox on touch screens
let swipeStart = null;
lightbox.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') swipeStart = { x: e.clientX, y: e.clientY };
});
lightbox.addEventListener('pointerup', e => {
  if (!swipeStart) return;
  const dx = e.clientX - swipeStart.x;
  const dy = e.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showPhoto(lightboxIndex + (dx < 0 ? 1 : -1));
});

document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('active')) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showPhoto(lightboxIndex - 1);
    else if (e.key === 'ArrowRight') showPhoto(lightboxIndex + 1);
    return;
  }
  if (e.key === 'Escape') closeAllModals();
});
