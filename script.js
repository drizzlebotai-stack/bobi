// === UTIL: current year in footer ===
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  initAuth();
});

const USER_DB_KEY = 'mysite-user-db';
const USER_COOKIE = 'mysite-user';

function initAuth() {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const authMessage = document.getElementById('auth-message');
  const statusEl = document.getElementById('auth-status');

  if (!signupForm && !loginForm) return;

  updateAuthUI();
  renderUserDump();

  signupForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = signupForm.querySelector('#signup-username')?.value.trim();
    const password = signupForm.querySelector('#signup-password')?.value;

    if (!username || !password) {
      updateAuthUI('Please provide both a username and password.');
      return;
    }

    const users = loadUsers();
    if (users.some((user) => user.username === username)) {
      updateAuthUI('That username is already taken.');
      return;
    }

    users.push({ username, password });
    saveUsers(users);
    signupForm.reset();
    updateAuthUI('Account created. You can log in now.');
    renderUserDump(users);
  });

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = loginForm.querySelector('#login-username')?.value.trim();
    const password = loginForm.querySelector('#login-password')?.value;

    const users = loadUsers();
    const foundUser = users.find((user) => user.username === username);

    if (!username || !password || !foundUser || foundUser.password !== password) {
      updateAuthUI('Invalid username or password.');
      return;
    }

    setCookie(USER_COOKIE, username);
    loginForm.reset();
    updateAuthUI('Logged in successfully.');
    renderUserDump(users);
  });

  logoutBtn?.addEventListener('click', () => {
    deleteCookie(USER_COOKIE);
    updateAuthUI('Logged out.');
    renderUserDump();
  });

  function updateAuthUI(feedbackMessage) {
    const currentUser = getCookie(USER_COOKIE);

    if (statusEl) {
      statusEl.textContent = currentUser
        ? `Logged in as ${currentUser}`
        : 'Not logged in.';
    }

    if (logoutBtn) logoutBtn.hidden = !currentUser;
    if (loginForm) loginForm.hidden = !!currentUser;

    if (authMessage) {
      authMessage.textContent = feedbackMessage ?? '';
    }
  }
}

function loadUsers() {
  const raw = localStorage.getItem(USER_DB_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse user database:', error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
}

function renderUserDump(users = loadUsers()) {
  const target = document.getElementById('user-dump-content');
  if (!target) return;

  if (!users.length) {
    target.textContent = '[]';
    target.setAttribute('data-empty', 'true');
    return;
  }

  target.textContent = JSON.stringify(users, null, 2);
  target.removeAttribute('data-empty');
}

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// === THEME PERSISTENCE + TOGGLE ============================================
// Modes: "light", "dark", "auto"
// We store only "light" or "dark". If nothing stored, we run "auto" (system).

(function () {
  const STORAGE_KEY = 'mysite-theme';
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');

  // Get saved theme or null
  const saved = localStorage.getItem(STORAGE_KEY); // "light" | "dark" | null

  // Set initial theme: saved or system
  function applyInitial() {
    if (saved === 'light' || saved === 'dark') {
      root.setAttribute('data-theme', saved);
    } else {
      root.setAttribute('data-theme', 'auto');
      // If auto, reflect system right now:
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
    updateButtonIcon();
  }

  // Update button visuals/text
  function updateButtonIcon() {
    if (!btn) return;
    const isLight = root.getAttribute('data-theme') === 'light';
    btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    btn.title = btn.getAttribute('aria-label');
    const iconEl = btn.querySelector('.theme-icon');
    if (iconEl) iconEl.textContent = isLight ? '☀️' : '🌙';
  }

  // Toggle & persist
  function toggleTheme() {
    const current = root.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    updateButtonIcon();
  }

  // React to system changes only if user didn’t choose manually
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener?.('change', () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const prefersDark = media.matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      updateButtonIcon();
    }
  });

  // Wire up button
  if (btn) {
    btn.addEventListener('click', toggleTheme);
    // Keyboard accessibility (Enter/Space already handled by button natively)
  }

  applyInitial();
})();
