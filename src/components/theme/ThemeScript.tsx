import { AUTH_STORAGE_KEYS } from "@/src/lib/auth/constants";

/** Inline script applied before paint to prevent theme flash */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var themeKey = '${AUTH_STORAGE_KEYS.theme}';
    var sessionKey = '${AUTH_STORAGE_KEYS.session}';
    var prefixes = ['/dashboard', '/appointments', '/patients', '/admin', '/reports', '/settings', '/profile'];
    var path = window.location.pathname;
    var isErpRoute = prefixes.some(function(prefix) {
      return path === prefix || path.indexOf(prefix + '/') === 0;
    });
    var rawSession = localStorage.getItem(sessionKey) || sessionStorage.getItem(sessionKey);
    var hasSession = false;
    if (rawSession) {
      try {
        var session = JSON.parse(rawSession);
        hasSession = !session.tokens || !session.tokens.expiresAt || Date.now() < session.tokens.expiresAt;
      } catch (e) {
        hasSession = false;
      }
    }
    var stored = localStorage.getItem(themeKey);
    var theme = isErpRoute && hasSession && (stored === 'dark' || stored === 'light') ? stored : 'light';
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
