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
      <rect fill="#FF453A" height="9" width="6" x="29" y="4" />
      <rect fill="#FF453A" height="5" width="12" x="26" y="8" />
      <rect fill="#F5F5F7" height="7" width="32" x="16" y="14" />
      <rect fill="#F5F5F7" height="26" width="42" x="11" y="21" />
      <rect fill="#F5F5F7" height="18" width="7" x="6" y="25" />
      <rect fill="#F5F5F7" height="18" width="7" x="51" y="25" />
      <rect fill="#F5F5F7" height="7" width="34" x="15" y="47" />
      <rect fill="#F5F5F7" height="8" width="8" x="19" y="53" />
      <rect fill="#F5F5F7" height="8" width="8" x="37" y="53" />
      <rect fill="#121214" height="8" width="5" x="21" y="29" />
      <rect fill="#121214" height="8" width="5" x="38" y="29" />
      <rect fill="#121214" height="3" width="14" x="25" y="42" />
      <rect fill="#8E8E93" height="3" width="8" x="28" y="40" />
    </svg>
  );
}

export function PlatformIcon({ provider, size = 24 }: { provider: "youtube" | "x" | "instagram" | "tiktok"; size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 32 32" width={size} shapeRendering="crispEdges">
      {provider === "youtube" && (
        <>
          <rect x="7" y="3" width="18" height="3" fill="#FF453A" />
          <rect x="4" y="6" width="24" height="20" fill="#FF453A" />
          <rect x="7" y="26" width="18" height="3" fill="#FF453A" />
          <path d="M13 10H17V13H20V18H17V21H13Z" fill="#FFFFFF" />
        </>
      )}
      {provider === "x" && (
        <>
          <rect x="2" y="2" width="28" height="28" fill="#121214" />
          <path d="M8 7H12V10H15V13H18V16H21V19H24V23H20V20H17V17H14V14H11V11H8ZM21 7H25V11H22V14H19V17H16V20H13V23H9V19H12V16H15V13H18V10H21Z" fill="#FFFFFF" />
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
          <rect x="14" y="5" width="5" height="17" fill="#FFFFFF" />
          <rect x="17" y="5" width="4" height="4" fill="#FFFFFF" />
          <rect x="20" y="8" width="4" height="4" fill="#FFFFFF" />
          <rect x="24" y="10" width="4" height="4" fill="#FFFFFF" />
          <rect x="8" y="18" width="10" height="5" fill="#FF453A" />
          <rect x="6" y="22" width="12" height="5" fill="#FF453A" />
          <rect x="10" y="25" width="7" height="3" fill="#FFFFFF" />
        </>
      )}
    </svg>
  );
}
