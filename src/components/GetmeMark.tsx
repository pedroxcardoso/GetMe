interface GetmeMarkProps {
  size?: number;
  className?: string;
}

export function GetmeMark({ size = 52, className }: GetmeMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height={size}
      viewBox="0 0 64 64"
      width={size}
      shapeRendering="crispEdges"
    >
      <rect fill="#F7B7CE" height="7" width="7" x="7" y="15" />
      <rect fill="#382B43" height="14" width="12" x="11" y="8" />
      <rect fill="#382B43" height="14" width="12" x="41" y="8" />
      <rect fill="#F6C7D9" height="8" width="7" x="14" y="11" />
      <rect fill="#F6C7D9" height="8" width="7" x="43" y="11" />
      <rect fill="#382B43" height="35" width="48" x="8" y="17" />
      <rect fill="#FFF9FC" height="29" width="40" x="12" y="21" />
      <rect fill="#382B43" height="7" width="4" x="20" y="31" />
      <rect fill="#382B43" height="7" width="4" x="40" y="31" />
      <rect fill="#F29BBB" height="4" width="7" x="13" y="39" />
      <rect fill="#F29BBB" height="4" width="7" x="44" y="39" />
      <rect fill="#382B43" height="3" width="4" x="30" y="41" />
      <rect fill="#382B43" height="3" width="4" x="34" y="41" />
      <rect fill="#F39ABB" height="14" width="7" x="27" y="3" />
      <rect fill="#F39ABB" height="7" width="14" x="23" y="7" />
      <rect fill="#FFD9A6" height="5" width="5" x="15" y="49" />
      <rect fill="#FFD9A6" height="5" width="5" x="44" y="49" />
      <rect fill="#382B43" height="5" width="40" x="12" y="52" />
      <rect fill="#382B43" height="4" width="24" x="20" y="57" />
      <rect fill="#F4C954" height="5" width="5" x="3" y="7" />
      <rect fill="#F4C954" height="5" width="5" x="54" y="17" />
    </svg>
  );
}

export function PlatformIcon({ provider, size = 24 }: { provider: "youtube" | "x" | "instagram" | "tiktok"; size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 32 32" width={size} shapeRendering="crispEdges">
      {provider === "youtube" && (
        <>
          <rect x="2" y="5" width="28" height="22" rx="6" fill="#F04F5E" />
          <path d="M13 10L22 16L13 22V10Z" fill="#FFFEF8" />
        </>
      )}
      {provider === "x" && (
        <>
          <rect x="2" y="2" width="28" height="28" fill="#283146" />
          <path d="M8 7H12L24 25H20L8 7ZM9 24L18 15M15 17L23 8" fill="none" stroke="#FFFEF8" strokeWidth="3" />
        </>
      )}
      {provider === "instagram" && (
        <>
          <rect x="2" y="2" width="28" height="28" fill="#D94D82" />
          <rect x="2" y="18" width="8" height="12" fill="#F6A948" />
          <rect x="2" y="10" width="5" height="8" fill="#F27A68" />
          <rect x="19" y="2" width="11" height="8" fill="#8956B5" />
          <rect x="25" y="10" width="5" height="10" fill="#BB4F9C" />
          <rect x="9" y="7" width="14" height="2" fill="#FFF9FC" />
          <rect x="7" y="9" width="2" height="14" fill="#FFF9FC" />
          <rect x="9" y="23" width="14" height="2" fill="#FFF9FC" />
          <rect x="23" y="9" width="2" height="14" fill="#FFF9FC" />
          <rect x="12" y="12" width="8" height="2" fill="#FFF9FC" />
          <rect x="10" y="14" width="2" height="6" fill="#FFF9FC" />
          <rect x="20" y="14" width="2" height="6" fill="#FFF9FC" />
          <rect x="12" y="20" width="8" height="2" fill="#FFF9FC" />
          <rect x="20" y="10" width="2" height="2" fill="#FFF9FC" />
        </>
      )}
      {provider === "tiktok" && (
        <>
          <rect x="2" y="2" width="28" height="28" fill="#283146" />
          <path d="M18 6V19.2A5.2 5.2 0 1 1 14 14.2V18A1.5 1.5 0 1 0 15.5 19.5V6H18ZM18 6C19 9.2 21 11 25 11V14.7C22.5 14.7 20.4 13.8 18 12V6Z" fill="#F39A83" transform="translate(1 1)" />
          <path d="M17 5V18.2A5.2 5.2 0 1 1 13 13.2V17A1.5 1.5 0 1 0 14.5 18.5V5H17ZM17 5C18 8.2 20 10 24 10V13.7C21.5 13.7 19.4 12.8 17 11V5Z" fill="#FFFEF8" />
          <path d="M15 17.2A1.5 1.5 0 1 0 15 20.2" fill="none" stroke="#78CED0" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
