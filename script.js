// === UTIL: current year in footer ===
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

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
