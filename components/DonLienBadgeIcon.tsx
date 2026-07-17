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
      <circle cx="64" cy="64" r="58" fill="#050805" stroke="#39FF14" strokeWidth="5" />
      <circle cx="64" cy="64" r="51" fill="#020604" />
      <g filter="url(#donlienLogoGlow)">
        <path
          d="M64 18c24 2 38 19 35 43-3 26-20 43-35 54-15-11-32-28-35-54-3-24 11-41 35-43Z"
          fill="#39FF14"
        />
        <path d="M46 65c-13-11-9-27 7-28 13 0 20 11 14 28-8 3-15 3-21 0Z" fill="#020604" />
        <path d="M82 65c13-11 9-27-7-28-13 0-20 11-14 28 8 3 15 3 21 0Z" fill="#020604" />
        <path d="M58 86c2 4 4 5 6 2 2 3 4 2 6-2-2 11-10 11-12 0Z" fill="#020604" opacity="0.92" />
      </g>
    </svg>
  );
}
