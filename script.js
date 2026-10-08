/* =========================================================
   TuitionMate | script.js  (Lab Task 02)
   Plain JavaScript only: DOM manipulation, events, validation.
   One file for both pages. Each feature checks that its
   elements exist first, so nothing breaks on the other page.
   ========================================================= */

// Keys used to save data in the browser's localStorage
const THEME_KEY = 'tuitionmate-theme';
const EMAIL_KEY = 'tuitionmate-remembered-email';
const ACCENT_KEY = 'tuitionmate-accent';

/* ---------- Small helpers for safe localStorage access ---------- */

// Read a value from localStorage (returns null if blocked/unavailable)
function storageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

// Save a value to localStorage (silently ignores errors, e.g. private mode)
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

// Remove a value from localStorage
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

/* =========================================================
   SHARED FEATURES (both pages)
   ========================================================= */

/**
 * Hamburger menu.
 * Clicking the button adds/removes the "open" class on the panel,
 * which CSS uses to show or hide it. The menu also closes when a
 * link is clicked, when clicking outside, or when Escape is pressed.
 */
function initHamburgerMenu() {
  const toggleBtn = document.getElementById('menu-toggle');
  const panel = document.getElementById('mobile-menu-panel');
  if (!toggleBtn || !panel) return;

  const icon = toggleBtn.querySelector('i');

  // Show or hide the panel and keep the icon + ARIA state in sync
  function setMenu(open) {
    panel.classList.toggle('open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    icon.classList.toggle('fa-bars', !open);
    icon.classList.toggle('fa-xmark', open);
  }

  toggleBtn.addEventListener('click', function () {
    setMenu(!panel.classList.contains('open'));
  });

  // Close after choosing a link
  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  // Close when clicking anywhere outside the menu
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.mobile-menu')) setMenu(false);
  });

  // Close with the Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenu(false);
  });

  // If the window grows to desktop size, reset the menu
  window.addEventListener('resize', function () {
    if (window.innerWidth > 780) setMenu(false);
  });
}

/**
 * Dark / light theme toggle.
 * Adds or removes the "dark-mode" class on <body>. The choice is
 * saved in localStorage so it is remembered on both pages and on
 * the next visit.
 */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;

  const icon = themeBtn.querySelector('i');

  // Apply a theme ('dark' or 'light') and update the button
  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // Load the saved theme when the page opens (default: light)
  applyTheme(storageGet(THEME_KEY) === 'dark' ? 'dark' : 'light');

  // Flip the theme on click and save the new choice
  themeBtn.addEventListener('click', function () {
    const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(next);
    storageSet(THEME_KEY, next);
  });
}

/**
 * Accent colour picker.
 * The palette button opens a row of colour swatches. Clicking a
 * swatch sets body[data-accent="..."], and CSS changes the
 * --blue-accent variables for that colour. The choice is saved in
 * localStorage, so it is remembered on both pages.
 */
function initColorPicker() {
  const toggleBtn = document.getElementById('color-picker-toggle');
  const options = document.getElementById('color-options');
  const picker = document.getElementById('color-picker');
  if (!toggleBtn || !options || !picker) return;

  const swatches = options.querySelectorAll('.color-swatch');
  const validColors = Array.from(swatches).map(function (s) { return s.dataset.color; });

  // Apply a colour name and highlight the matching swatch
  function applyAccent(color) {
    if (color === 'blue') {
      delete document.body.dataset.accent; // blue is the default
    } else {
      document.body.dataset.accent = color;
    }
    swatches.forEach(function (swatch) {
      const isActive = swatch.dataset.color === color;
      swatch.classList.toggle('active', isActive);
      swatch.setAttribute('aria-pressed', String(isActive));
    });
  }

  // Open or close the swatch row
  function setOpen(open) {
    options.hidden = !open;
    toggleBtn.setAttribute('aria-expanded', String(open));
  }

  // Load the saved colour (falls back to blue)
  const saved = storageGet(ACCENT_KEY);
  applyAccent(validColors.includes(saved) ? saved : 'blue');

  toggleBtn.addEventListener('click', function () { setOpen(options.hidden); });

  // Choose a colour and save it
  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      applyAccent(swatch.dataset.color);
      storageSet(ACCENT_KEY, swatch.dataset.color);
    });
  });

  // Close when clicking outside or pressing Escape
  document.addEventListener('click', function (event) {
    if (!picker.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setOpen(false);
  });
}

/* =========================================================
   HOME PAGE (index.html)
   ========================================================= */

/**
 * Popular subjects filter.
 * On every keystroke, compare the typed text with each subject
 * card's text. Non-matching cards get the "hidden" class. If no
 * card matches, the "No subject found" message is shown.
 */
function initSubjectSearch() {
  const searchInput = document.getElementById('subject-search');
  const cards = document.querySelectorAll('.subject-tag');
  const emptyMessage = document.getElementById('no-subject');
  if (!searchInput || cards.length === 0 || !emptyMessage) return;

  // Show only the cards that match the current search text
  function filterSubjects() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(function (card) {
      const matches = card.textContent.toLowerCase().includes(query);
      card.classList.toggle('hidden', !matches);
      if (matches) visibleCount++;
    });

    // Show the message only when nothing is visible
    emptyMessage.hidden = visibleCount > 0;
  }

  searchInput.addEventListener('input', filterSubjects);
}

/**
 * Animated counters.
 * Each .counter element has a data-target (final number). When the
 * page loads, the number counts up from 0 over about 2 seconds
 * using requestAnimationFrame and an ease-out curve.
 */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (counters.length === 0) return;

  const duration = 2000; // animation length in milliseconds

  // Animate one counter element from 0 to its target value
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    // Runs on every animation frame until the duration has passed
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // slows down near the end
      el.textContent = Math.round(target * eased).toLocaleString() + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  counters.forEach(animateCounter);
}

/**
 * Back to Top button.
 * Appears (class "show") once the user scrolls down 300px and
 * scrolls smoothly back to the top when clicked.
 */
function initBackToTop() {
  const topBtn = document.getElementById('back-to-top');
  if (!topBtn) return;

  // Show or hide the button depending on scroll position
  function updateVisibility() {
    topBtn.classList.toggle('show', window.scrollY > 300);
  }

  window.addEventListener('scroll', updateVisibility);
  updateVisibility(); // set correct state on load

  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =========================================================
   LOGIN PAGE (login.html)
   ========================================================= */

/**
 * Login form: validation, show/hide password, remember me,
 * and success message.
 */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const rememberBox = document.getElementById('remember-me');
  const toggleBtn = document.getElementById('toggle-password');
  const successBox = document.getElementById('login-success');
  const successText = document.getElementById('login-success-text');

  // Basic email pattern: text@text.text with no spaces
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Show an error under a field: red text + red border
  function showError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
  }

  // Remove the error state from a field
  function clearError(input, errorEl) {
    errorEl.textContent = '';
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
  }

  // Check the email field. Returns true if valid.
  function validateEmail() {
    const value = emailInput.value.trim();
    if (value === '') {
      showError(emailInput, emailError, 'Email address is required.');
      return false;
    }
    if (!emailPattern.test(value)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  }

  // Check the password field (at least 6 characters). Returns true if valid.
  function validatePassword() {
    const value = passwordInput.value;
    if (value === '') {
      showError(passwordInput, passwordError, 'Password is required.');
      return false;
    }
    if (value.length < 6) {
      showError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      return false;
    }
    clearError(passwordInput, passwordError);
    return true;
  }

  // Pre-fill the email if "Remember me" was used on a previous visit
  const savedEmail = storageGet(EMAIL_KEY);
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberBox.checked = true;
  }

  // Show/hide password: switch the input type and the eye icon
  toggleBtn.addEventListener('click', function () {
    const icon = toggleBtn.querySelector('i');
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !isHidden);
    icon.classList.toggle('fa-eye-slash', isHidden);
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  // Clear a field's error as soon as the user edits it
  emailInput.addEventListener('input', function () {
    clearError(emailInput, emailError);
    successBox.hidden = true;
  });
  passwordInput.addEventListener('input', function () {
    clearError(passwordInput, passwordError);
    successBox.hidden = true;
  });

  // On submit: stop the page reload, validate, then show success or errors
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    successBox.hidden = true;

    // Run both checks (no short-circuit so both errors show together)
    const emailOk = validateEmail();
    const passwordOk = validatePassword();

    if (!emailOk || !passwordOk) {
      // Move focus to the first invalid field
      (emailOk ? passwordInput : emailInput).focus();
      return;
    }

    // Remember me: save the email, or forget it if unchecked
    if (rememberBox.checked) {
      storageSet(EMAIL_KEY, emailInput.value.trim());
    } else {
      storageRemove(EMAIL_KEY);
    }

    // Show success message without reloading the page
    successText.textContent = 'Login successful! Welcome to TuitionMate';
    successBox.hidden = false;
    passwordInput.value = '';
  });
}

/**
 * Space background (login, sign-up and reset pages).
 * Draws twinkling stars, sparkle stars and occasional shooting stars
 * on a <canvas>, with a gentle mouse parallax. The canvas fills the
 * .login-main area, resizes with it, and pauses when the tab is
 * hidden. With "reduce motion" on, it draws one still frame.
 */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  const area = document.querySelector('.login-main');
  if (!canvas || !area) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['#ffffff', '#e0f2fe', '#fdf4ff', '#fbcfe8', '#bae6fd'];
  let width = 0, height = 0, stars = [], shooters = [];
  let tick = 0, rafId = 0;
  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  function buildStars() {
    stars = [];
    const count = Math.floor((width * height) / 3200);
    for (let i = 0; i < count; i++) {
      const sparkle = Math.random() < 0.08;
      const base = sparkle ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.7;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: sparkle ? Math.random() * 1.8 + 1.2 : Math.random() * 1.3 + 0.5,
        base: base,
        speed: 0.008 + Math.random() * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
        sparkle: sparkle
      });
    }
  }

  // Match the canvas to its container (sharp on high-DPI screens)
  function resize() {
    const rect = area.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (reduceMotion) draw();
  }

  function draw() {
    tick++;
    curX += (targetX - curX) * 0.05;
    curY += (targetY - curY) * 0.05;
    ctx.clearRect(0, 0, width, height);

    stars.forEach(function (star, i) {
      const opacity = Math.max(0.1, Math.min(1, star.base + Math.sin(tick * star.speed + i) * 0.35));
      const x = star.x + curX * star.size * 0.8;
      const y = star.y + curY * star.size * 0.8;
      ctx.fillStyle = star.color;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      if (star.sparkle) {
        const s = star.size * 2.2;
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s * 0.25, y - s * 0.25);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x + s * 0.25, y + s * 0.25);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x - s * 0.25, y + s * 0.25);
        ctx.lineTo(x - s, y);
        ctx.lineTo(x - s * 0.25, y - s * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, star.size * 0.8, 0, Math.PI * 2);
      } else {
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
      }
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (reduceMotion) return;

    // Occasionally launch a shooting star (max 2 at once)
    if (Math.random() < 0.012 && shooters.length < 2) {
      shooters.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 9 + 7,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        life: 1
      });
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const ss = shooters[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life -= 0.015;
      if (ss.life <= 0 || ss.x > width + 100 || ss.y > height + 100) { shooters.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(255,255,255,' + (ss.life * 0.8) + ')';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
      ctx.stroke();
    }
    rafId = requestAnimationFrame(draw);
  }

  if (!reduceMotion) {
    window.addEventListener('mousemove', function (e) {
      targetX = (e.clientX - window.innerWidth / 2) * 0.03;
      targetY = (e.clientY - window.innerHeight / 2) * 0.03;
    });
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(area);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();
  if (!reduceMotion) rafId = requestAnimationFrame(draw);
}

/**
 * Google / GitHub buttons (login page).
 * There is no real OAuth backend in this student project, so the
 * buttons show a clear notice instead of a dead or broken link.
 */
function initSocialButtons() {
  const notice = document.getElementById('social-notice');
  const buttons = document.querySelectorAll('.social-login [data-provider]');
  if (!notice || buttons.length === 0) return;
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      notice.textContent = btn.dataset.provider + ' login is not connected in this demo. Please use email and password.';
      notice.hidden = false;
    });
  });
}

/**
 * Helpers shared by the sign-up and reset-password forms.
 */
function fieldHelpers(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + '-error');
  return {
    input: input,
    show: function (msg) { error.textContent = msg; input.classList.add('input-error'); input.setAttribute('aria-invalid', 'true'); },
    clear: function () { error.textContent = ''; input.classList.remove('input-error'); input.removeAttribute('aria-invalid'); }
  };
}

/** Sign-up form: name, email, password and confirm-password checks. */
function initSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const name = fieldHelpers('name');
  const email = fieldHelpers('email');
  const pass = fieldHelpers('password');
  const confirm = fieldHelpers('confirm');
  const successBox = document.getElementById('form-success');
  const successText = document.getElementById('form-success-text');
  const toggleBtn = document.getElementById('toggle-password');

  toggleBtn.addEventListener('click', function () {
    const icon = toggleBtn.querySelector('i');
    const hidden = pass.input.type === 'password';
    pass.input.type = hidden ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !hidden);
    icon.classList.toggle('fa-eye-slash', hidden);
    toggleBtn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
  });

  [name, email, pass, confirm].forEach(function (f) {
    f.input.addEventListener('input', function () { f.clear(); successBox.hidden = true; });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    successBox.hidden = true;
    let firstBad = null;
    function fail(f, msg) { f.show(msg); if (!firstBad) firstBad = f.input; }

    if (name.input.value.trim().length < 2) fail(name, 'Please enter your full name.');
    const e = email.input.value.trim();
    if (e === '') fail(email, 'Email address is required.');
    else if (!emailPattern.test(e)) fail(email, 'Please enter a valid email address.');
    if (pass.input.value === '') fail(pass, 'Password is required.');
    else if (pass.input.value.length < 6) fail(pass, 'Password must be at least 6 characters.');
    if (confirm.input.value === '') fail(confirm, 'Please confirm your password.');
    else if (confirm.input.value !== pass.input.value) fail(confirm, 'Passwords do not match.');

    if (firstBad) { firstBad.focus(); return; }

    successText.textContent = 'Account created! Redirecting to login…';
    successBox.hidden = false;
    form.reset();
    setTimeout(function () { window.location.href = 'login.html'; }, 1600);
  });
}

/** Reset-password form: validates the email and shows a confirmation. */
function initForgotForm() {
  const form = document.getElementById('forgot-form');
  if (!form) return;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = fieldHelpers('email');
  const successBox = document.getElementById('form-success');
  const successText = document.getElementById('form-success-text');

  email.input.addEventListener('input', function () { email.clear(); successBox.hidden = true; });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    successBox.hidden = true;
    const value = email.input.value.trim();
    if (value === '') { email.show('Email address is required.'); email.input.focus(); return; }
    if (!emailPattern.test(value)) { email.show('Please enter a valid email address.'); email.input.focus(); return; }
    successText.textContent = 'If an account exists for ' + value + ', a reset link has been sent.';
    successBox.hidden = false;
    form.reset();
  });
}

/* =========================================================
   START: run every feature once the page has loaded
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  initHamburgerMenu();
  initThemeToggle();
  initColorPicker();
  initSubjectSearch();
  initCounters();
  initBackToTop();
  initLoginForm();
  initStarfield();
  initSocialButtons();
  initSignupForm();
  initForgotForm();
});
