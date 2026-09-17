/**
 * Theme Module
 * Manages color palette selection, localStorage persistence, and DOM updates.
 */

export const THEMES = [
  {
    id: 'indigo',
    name: 'Cyber Indigo',
    color: '#6366f1',
    swatchClass: 'swatch-indigo'
  },
  {
    id: 'emerald',
    name: 'Emerald Jade',
    color: '#10b981',
    swatchClass: 'swatch-emerald'
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    color: '#06b6d4',
    swatchClass: 'swatch-cyan'
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    color: '#f59e0b',
    swatchClass: 'swatch-amber'
  },
  {
    id: 'rose',
    name: 'Neon Rose',
    color: '#f43f5e',
    swatchClass: 'swatch-rose'
  }
];

export function getThemeConfig() {
  if (typeof window !== 'undefined' && window.__THEME_CONFIG__) {
    return window.__THEME_CONFIG__;
  }
  return {
    theme: 'indigo',
    showSwitcher: true,
    allowVisitorOverride: true
  };
}

export function getStoredTheme() {
  const config = getThemeConfig();
  if (!config.allowVisitorOverride) {
    return config.theme || 'indigo';
  }
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored || config.theme || 'indigo';
  } catch (e) {
    return config.theme || 'indigo';
  }
}

export function setTheme(themeId) {
  const config = getThemeConfig();
  const validTheme = THEMES.find(t => t.id === themeId);
  const selectedTheme = validTheme ? themeId : (config.theme || 'indigo');

  if (selectedTheme === 'indigo') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', selectedTheme);
  }

  if (config.allowVisitorOverride) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
    } catch (e) {
      // Storage access might be restricted
    }
  }

  updateSwitcherUI(selectedTheme);
}

function updateSwitcherUI(activeThemeId) {
  // Update desktop dropdown options
  const options = document.querySelectorAll('.theme-option');
  options.forEach(opt => {
    const optTheme = opt.getAttribute('data-theme-value');
    if (optTheme === activeThemeId) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  // Update mobile chips
  const mobileChips = document.querySelectorAll('.mobile-theme-chip');
  mobileChips.forEach(chip => {
    const chipTheme = chip.getAttribute('data-theme-value');
    if (chipTheme === activeThemeId) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Update trigger button active dot color
  const activeTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const activeDot = document.querySelector('.theme-active-dot');
  if (activeDot) {
    activeDot.style.background = activeTheme.color;
    activeDot.style.boxShadow = `0 0 8px ${activeTheme.color}`;
  }
}

export function initTheme() {
  const currentTheme = getStoredTheme();
  setTheme(currentTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  const menu = document.getElementById('theme-menu');
  const options = document.querySelectorAll('.theme-option');
  const mobileChips = document.querySelectorAll('.mobile-theme-chip');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = menu.classList.contains('active');
      if (isActive) {
        menu.classList.remove('active');
        toggleBtn.classList.remove('active');
      } else {
        menu.classList.add('active');
        toggleBtn.classList.add('active');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('active');
        toggleBtn.classList.remove('active');
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggleBtn.classList.remove('active');
      }
    });
  }

  // Bind click on desktop options
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const themeId = opt.getAttribute('data-theme-value');
      setTheme(themeId);
      if (menu) menu.classList.remove('active');
      if (toggleBtn) toggleBtn.classList.remove('active');
    });
  });

  // Bind click on mobile chips
  mobileChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const themeId = chip.getAttribute('data-theme-value');
      setTheme(themeId);
    });
  });
}
