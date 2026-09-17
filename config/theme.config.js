/**
 * Theme & Color Palette Configuration
 *
 * Change the active palette here or override it via .env (PORTFOLIO_THEME).
 *
 * Available palettes (all keep the dark background):
 * - 'indigo'  : Cyber Indigo (Deep slate/violet - Default)
 * - 'emerald' : Emerald Jade (Matrix / high-performance terminal)
 * - 'cyan'    : Electric Cyan (Quantum / cloud infrastructure)
 * - 'amber'   : Solar Amber (High-energy warmth / solar flare)
 * - 'rose'    : Neon Rose (Synthwave / cyberpunk neon)
 */

export const themeConfig = {
  // Active palette
  theme: 'emerald',

  // Show interactive palette switcher dropdown in navbar and mobile drawer
  showSwitcher: true,

  // Allow visitors to temporarily switch palette in their browser via localStorage
  // Set to false if you want the site to strictly enforce the configured palette
  allowVisitorOverride: true
};
