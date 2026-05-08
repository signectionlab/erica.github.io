const themeToggleBtn = document.getElementById('theme-toggle');

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  } else {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  }
  localStorage.setItem('theme', theme);
  
  // Dispatch event for Giscus
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
}

function toggleTheme() {
  const isDark = document.body.classList.contains('theme-dark');
  setTheme(isDark ? 'light' : 'dark');
}

// Initialize theme
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
  setTheme(savedTheme);
} else if (systemPrefersDark) {
  setTheme('dark');
} else {
  setTheme('light');
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}
