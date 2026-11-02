// Apply saved settings before first paint. Storage may be blocked on shared devices.
(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const sizes = ['default', 'large', 'extra'];
  let theme;
  let size;
  try {
    theme = localStorage.getItem('ccae-theme');
    size = localStorage.getItem('ccae-print');
  } catch { /* The controls still work for this visit. */ }

  function save(key, value) {
    try { localStorage.setItem(key, value); }
    catch { /* Keep the current session preference. */ }
  }

  function updateTheme() {
    const dark = theme === 'dark' || (theme !== 'light' && systemTheme.matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  root.dataset.print = sizes.includes(size) ? size : 'default';
  updateTheme();
  systemTheme.addEventListener('change', updateTheme);
  document.addEventListener('DOMContentLoaded', () => {
    updateTheme();
    document.getElementById('theme-toggle').addEventListener('click', () => {
      theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      save('ccae-theme', theme);
      updateTheme();
    });
    const picker = document.getElementById('print-size');
    picker.value = root.dataset.print;
    picker.addEventListener('change', () => {
      root.dataset.print = picker.value;
      save('ccae-print', picker.value);
    });
  });
})();
