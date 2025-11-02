import React from "react";

interface BrandLogoProps {
  size?: number | string;
  className?: string;
}

/**
 * BrandLogo
 * ProCut logomark: lens ring + play triangle (clean, no slash).
 * Subtle animated gradient via stops; keeps a clean, professional silhouette.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 20, className = "" }) => {
  const px = typeof size === "number" ? `${size}` : size;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="procut-logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      {/* Lens ring */}
      <circle cx="12" cy="12" r="8.5" stroke="hsl(var(--foreground))" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.75" stroke="hsl(var(--border))" strokeOpacity="0.6" strokeWidth="1" />

      {/* Play triangle outline */}
      <path
        d="M10 8 L16 12 L10 16 Z"
        stroke="url(#procut-logo-gradient)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />

    </svg>
  );
};

export default BrandLogo;
