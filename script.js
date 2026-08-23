/**
 * OCUUPIED — CLIENT SCRIPT
 * Vanilla JS: Scroll animations, gentle blob parallax, download handler, interactive preview
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initBlobParallax();
  initSmoothScroll();
  initDownloadHandler();
  initPreviewInteractions();
  initYear();
});

/**
 * 1. SCROLL REVEAL (IntersectionObserver)
 * Staggered fade-up + slight scale-in for sections and feature cards (<400ms duration)
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target); // Reveal once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 2. SUBTLE PARALLAX DRIFT ON BACKGROUND BLOBS (5-10px max)
 */
function initBlobParallax() {
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length) return;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        
        // Gentle parallax movement (capped between 5px and 12px)
        blobs.forEach((blob, index) => {
          const speed = (index + 1) * 0.018;
          const yOffset = (scrolled * speed) % 12;
          const xOffset = Math.sin(scrolled * 0.002 + index) * 6;
          blob.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        });

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 3. SMOOTH SCROLLING FOR ALL ANCHOR LINKS
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 4. DOWNLOAD BUTTON HANDLER
 * Handles active Windows download and keeps placeholder feedback for coming-soon platforms
 */
function initDownloadHandler() {
  const windowsBtn = document.getElementById('windows-download-btn');
  const disabledButtons = document.querySelectorAll('.platform-disabled .btn-disabled');
  const toast = document.getElementById('toast-message');

  // Windows Download Flow
  if (windowsBtn) {
    windowsBtn.addEventListener('click', (e) => {
      const downloadUrl = windowsBtn.getAttribute('data-download-url') || windowsBtn.getAttribute('href');

      // Check if URL is still an unconfigured placeholder
      if (!downloadUrl || downloadUrl === '#' || downloadUrl.includes('your-username')) {
        e.preventDefault();
        showToast('🐻 Download placeholder: Please configure your real GitHub Releases URL in data-download-url');
        return;
      }

      // Valid download URL configured (e.g. downloads/test.txt or real release)
      // We do NOT call e.preventDefault() so the browser executes the download seamlessly
      showToast('🐻 Starting download for Windows (.exe)...');
    });
  }

  // macOS & Linux Placeholder Buttons Feedback
  disabledButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('🐻 This platform build is currently in progress! Stay tuned for v1.1.');
    });
  });

  function showToast(message) {
    if (!toast) return;
    const toastText = toast.querySelector('.toast-text');
    if (toastText && message) {
      toastText.textContent = message;
    }

    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
      toast.setAttribute('aria-hidden', 'true');
    }, 4000);
  }
}

/**
 * 5. INTERACTIVE APP PREVIEW WINDOW
 * Adds tactile feel when clicking mock navigation tabs inside the screenshot preview
 */
function initPreviewInteractions() {
  const navItems = document.querySelectorAll('.app-nav-item');
  if (!navItems.length) return;

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/**
 * 6. DYNAMIC CURRENT YEAR IN FOOTER
 */
function initYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
