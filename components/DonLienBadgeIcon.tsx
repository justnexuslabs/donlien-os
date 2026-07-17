type DonLienBadgeIconProps = {
  className?: string;
};

export function DonLienBadgeIcon({ className = "" }: DonLienBadgeIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      role="img"
      aria-label="DonLien neon alien logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="donlienLogoGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feColorMatrix
            in="blur"
            result="greenGlow"
            type="matrix"
            values="0 0 0 0 0.22 0 0 0 0 1 0 0 0 0 0.08 0 0 0 1 0"
          />
          <feMerge>
            <feMergeNode in="greenGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="64" cy="64" r="58" fill="#050805" stroke="#39FF14" strokeWidth="6" />
      <circle cx="64" cy="64" r="46" fill="#020604" opacity="0.96" />
      <g filter="url(#donlienLogoGlow)">
        <path
          d="M64 25c21 2 33 17 30 39-3 22-18 38-30 48-12-10-27-26-30-48-3-22 9-37 30-39Z"
          fill="#39FF14"
        />
        <path d="M47 65c-11-9-8-23 6-24 11 0 17 9 12 24-7 2-13 2-18 0Z" fill="#020604" />
        <path d="M81 65c11-9 8-23-6-24-11 0-17 9-12 24 7 2 13 2 18 0Z" fill="#020604" />
        <path d="M58 84c2 4 4 5 6 2 2 3 4 2 6-2-2 11-10 11-12 0Z" fill="#020604" opacity="0.92" />
      </g>
    </svg>
  );
}
