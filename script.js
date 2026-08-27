/**
 * OCCUPIED — CLIENT SCRIPT
 * Vanilla JS: Scroll animations, gentle blob parallax, download handler, interactive preview
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initBlobParallax();
  initSmoothScroll();
  initDownloadFlow();
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
 * 4. DOWNLOAD & SIGNUP MODAL FLOW
 * Handles session verification, modal popup triggers, Supabase signup, downloads logging, and file delivery
 */
function initDownloadFlow() {
  const windowsBtn = document.getElementById('windows-download-btn');
  const disabledButtons = document.querySelectorAll('.platform-disabled .btn-disabled');
  const modalOverlay = document.getElementById('download-auth-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalForm = document.getElementById('modal-auth-form');
  const emailInput = document.getElementById('modal-email');
  const passwordInput = document.getElementById('modal-password');
  const submitBtn = document.getElementById('modal-submit-btn');
  const submitText = document.getElementById('modal-submit-text');
  const feedbackBox = document.getElementById('modal-feedback');
  const toast = document.getElementById('toast-message');

  // Check if Supabase client is configured
  function isSupabaseConfigured() {
    return (
      typeof window.supabaseClient !== 'undefined' &&
      window.supabaseClient !== null &&
      typeof SUPABASE_URL !== 'undefined' &&
      !SUPABASE_URL.includes('YOUR_SUPABASE_URL_HERE')
    );
  }

  // Open Modal
  function openAuthModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('is-active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    hideModalFeedback();
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 150);
    }
  }

  // Close Modal
  function closeAuthModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    hideModalFeedback();
    if (modalForm) {
      modalForm.reset();
    }
  }

  // Modal feedback display
  function showModalFeedback(message, type = 'error') {
    if (!feedbackBox) return;
    feedbackBox.textContent = message;
    feedbackBox.className = `modal-feedback-box modal-feedback-${type}`;
    feedbackBox.style.display = 'block';
  }

  function hideModalFeedback() {
    if (!feedbackBox) return;
    feedbackBox.style.display = 'none';
    feedbackBox.textContent = '';
  }

  // Trigger file download & show toast
  function triggerDownload() {
    const downloadUrl = windowsBtn ? (windowsBtn.getAttribute('data-download-url') || windowsBtn.getAttribute('href')) : '';
    if (downloadUrl && downloadUrl !== '#' && !downloadUrl.includes('your-username')) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'MyApp.exe');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    showToast('🐻 Starting download for Windows (.exe)...');
  }

  // Log download to Supabase
  async function logDownloadEvent(userId) {
    if (!userId || !isSupabaseConfigured()) return;
    try {
      await window.supabaseClient.from('downloads').insert({ user_id: userId });
    } catch (err) {
      console.warn('Could not record download row in Supabase:', err);
    }
  }

  // Windows Download Button Click Listener
  if (windowsBtn) {
    windowsBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Check if user already has an active session
      if (isSupabaseConfigured()) {
        try {
          const { data } = await window.supabaseClient.auth.getSession();
          const session = data?.session;
          if (session && session.user) {
            // Already logged in: log download and download immediately
            await logDownloadEvent(session.user.id);
            triggerDownload();
            return;
          }
        } catch (err) {
          console.warn('Session check error:', err);
        }
      }

      // No session: open modal popup
      openAuthModal();
    });
  }

  // Modal Dismissal Listeners
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeAuthModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeAuthModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-active')) {
      closeAuthModal();
    }
  });

  // Modal Form Submission Handler
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideModalFeedback();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!email || !password) {
        showModalFeedback('Please provide both email and password.');
        return;
      }

      if (password.length < 6) {
        showModalFeedback('Password must be at least 6 characters long.');
        return;
      }

      if (!isSupabaseConfigured()) {
        showModalFeedback('Supabase credentials have not been configured yet in supabase-config.js.');
        return;
      }

      // Set Loading state
      submitBtn.disabled = true;
      const originalText = submitText ? submitText.textContent : 'Sign Up & Download';
      if (submitText) submitText.textContent = 'Creating account...';

      try {
        const { data, error } = await window.supabaseClient.auth.signUp({
          email,
          password
        });

        if (error) {
          const msg = error.message || '';
          // If email is already registered, don't block them — proceed to download!
          if (
            msg.toLowerCase().includes('already registered') ||
            msg.toLowerCase().includes('already exists') ||
            error.code === 'user_already_exists' ||
            error.status === 422
          ) {
            closeAuthModal();
            triggerDownload();
            return;
          }

          if (msg.toLowerCase().includes('password')) {
            showModalFeedback('Password must be at least 6 characters long.');
          } else if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
            showModalFeedback('Connection error. Please check your internet connection or Supabase URL.');
          } else {
            showModalFeedback(msg || 'Sign up failed. Please check your details and try again.');
          }
          return;
        }

        // Successful signup
        const userId = data?.session?.user?.id || data?.user?.id;
        if (userId) {
          await logDownloadEvent(userId);
        }

        closeAuthModal();
        triggerDownload();
      } catch (err) {
        showModalFeedback(err.message || 'An unexpected error occurred. Please try again.');
      } finally {
        submitBtn.disabled = false;
        if (submitText) submitText.textContent = originalText;
      }
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

