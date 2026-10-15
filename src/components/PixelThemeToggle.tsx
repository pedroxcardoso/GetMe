import type { ColorTheme } from "../env";

export function PixelThemeToggle({
  disabled = false,
  theme,
  onToggle,
}: {
  disabled?: boolean;
  theme: ColorTheme;
  onToggle: () => void;
}) {
  const isDark = theme === "dark";
  return (
    <button
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-pressed={isDark}
      className={`theme-toggle ${isDark ? "theme-dark" : "theme-light"}`}
      disabled={disabled}
      onClick={onToggle}
      title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      type="button"
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? <PixelMoon /> : <PixelSun />}
      </span>
      <span className="theme-toggle-label">{isDark ? "Lua" : "Sol"}</span>
    </button>
  );
}

function PixelSun() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" shapeRendering="crispEdges">
      <rect fill="#E99B35" height="4" width="4" x="10" y="1" />
      <rect fill="#E99B35" height="4" width="4" x="10" y="19" />
      <rect fill="#E99B35" height="4" width="4" x="1" y="10" />
      <rect fill="#E99B35" height="4" width="4" x="19" y="10" />
      <rect fill="#E99B35" height="3" width="3" x="4" y="4" />
      <rect fill="#E99B35" height="3" width="3" x="17" y="4" />
      <rect fill="#E99B35" height="3" width="3" x="4" y="17" />
      <rect fill="#E99B35" height="3" width="3" x="17" y="17" />
      <rect fill="#FFE28A" height="10" width="10" x="7" y="7" />
      <rect fill="#FFF9FC" height="3" width="4" x="9" y="9" />
    </svg>
  );
}

function PixelMoon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" shapeRendering="crispEdges">
      <rect fill="#FFE28A" height="4" width="4" x="12" y="1" />
      <rect fill="#FFE28A" height="4" width="9" x="9" y="5" />
      <rect fill="#FFE28A" height="4" width="12" x="6" y="9" />
      <rect fill="#FFE28A" height="4" width="13" x="5" y="13" />
      <rect fill="#FFE28A" height="4" width="10" x="8" y="17" />
      <rect fill="#FFE28A" height="3" width="5" x="12" y="21" />
      <rect fill="#FFF9FC" height="2" width="2" x="3" y="4" />
      <rect fill="#FFF9FC" height="2" width="2" x="20" y="19" />
    </svg>
  );
}
