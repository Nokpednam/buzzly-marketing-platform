import React from 'react';

interface BuzzlyLogoProps {
  size?: number;
  className?: string;
}

const BuzzlyLogo: React.FC<BuzzlyLogoProps> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle - blue background */}
      <circle cx="50" cy="50" r="48" fill="hsl(var(--primary))" />
      
      {/* Inner circle border */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
      
      {/* Inner white/cream circle */}
      <circle cx="50" cy="50" r="36" fill="hsl(var(--background))" />
      
      {/* Letter B - Left half (dark) */}
      <clipPath id="leftHalf">
        <rect x="25" y="20" width="25" height="60" />
      </clipPath>
      
      {/* Letter B - Right half (white) */}
      <clipPath id="rightHalf">
        <rect x="50" y="20" width="25" height="60" />
      </clipPath>
      
      {/* B letter path - dark side */}
      <g clipPath="url(#leftHalf)">
        <path
          d="M35 22H52C58 22 63 26 63 32C63 36 60 39 57 40C61 41 65 45 65 51C65 58 60 62 53 62H35V22ZM43 38H50C53 38 55 36 55 33C55 30 53 28 50 28H43V38ZM43 56H51C55 56 57 54 57 50C57 46 55 44 51 44H43V56Z"
          fill="hsl(var(--foreground))"
        />
      </g>
      
      {/* B letter path - light side */}
      <g clipPath="url(#rightHalf)">
        <path
          d="M35 22H52C58 22 63 26 63 32C63 36 60 39 57 40C61 41 65 45 65 51C65 58 60 62 53 62H35V22ZM43 38H50C53 38 55 36 55 33C55 30 53 28 50 28H43V38ZM43 56H51C55 56 57 54 57 50C57 46 55 44 51 44H43V56Z"
          fill="hsl(var(--primary-foreground))"
        />
      </g>
      
      {/* Sparkle top-right */}
      <g transform="translate(72, 18)">
        <path
          d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3L4 0Z"
          fill="hsl(var(--accent))"
        />
      </g>
      
      {/* Sparkle small */}
      <g transform="translate(78, 28)">
        <circle cx="2" cy="2" r="2" fill="hsl(var(--accent))" />
      </g>
      
      {/* Sparkle left */}
      <g transform="translate(18, 25)">
        <path
          d="M3 0L3.5 2L6 2.5L3.5 3L3 5L2.5 3L0 2.5L2.5 2L3 0Z"
          fill="hsl(var(--accent))"
        />
      </g>
    </svg>
  );
};

export default BuzzlyLogo;
