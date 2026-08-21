// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');

hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.nav-link, .nav-login').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');

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

// Scroll reveal (progressive enhancement: elements are visible by default in
// CSS; only once JS confirms it can observe them do we hide-then-reveal them,
// with a timeout safety net in case IntersectionObserver never fires).
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  revealEls.forEach(el => el.classList.add('pre-reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        entry.target.classList.remove('pre-reveal');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  // Safety net: force-reveal anything left hidden after 2.5s.
  setTimeout(() => {
    document.querySelectorAll('.reveal.pre-reveal:not(.in-view)').forEach(el => {
      el.classList.add('in-view');
      el.classList.remove('pre-reveal');
    });
  }, 2500);
}

// Header background on scroll
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.background = window.scrollY > 40 ? 'rgba(11,11,12,.97)' : 'rgba(11,11,12,.85)';
}, { passive: true });

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-item').forEach(btn => {
  btn.addEventListener('click', () => {
    lightboxImg.src = btn.dataset.full;
    lightboxImg.alt = btn.querySelector('img').alt;
    lightbox.classList.add('active');
  });
});

function closeLightbox() {
  lightbox.classList.remove('active');
  lightboxImg.src = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// Page loader
window.addEventListener('load', () => {
  document.getElementById('pageLoader').classList.add('loaded');
});
