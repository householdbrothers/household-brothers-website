// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('mobile-open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
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

// Photo marquee: speed up while the page is scrolling, ease back to the
// normal pace shortly after scrolling stops. Hover-to-pause is handled in CSS.
const photoMarquee = document.getElementById('photoMarquee');
if (photoMarquee) {
  let scrollStopTimer = null;
  window.addEventListener('scroll', () => {
    photoMarquee.classList.add('is-scrolling');
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      photoMarquee.classList.remove('is-scrolling');
    }, 350);
  }, { passive: true });
}

// Site modals (membership popups)
document.querySelectorAll('[data-modal-open]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = document.getElementById(btn.getAttribute('data-modal-open'));
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

function closeAllModals() {
  document.querySelectorAll('.site-modal.active').forEach(modal => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  });
  document.body.style.overflow = '';
}

document.querySelectorAll('.site-modal').forEach(modal => {
  modal.addEventListener('click', (e) => { if (e.target === modal) closeAllModals(); });
  modal.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeAllModals));
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

// Gallery lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.photo-cell img').forEach(img => {
  img.parentElement.style.cursor = 'pointer';
  img.parentElement.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
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
