import React, { cloneElement } from "react";

/**
 * AnimatedIcon
 * Wrap a lucide-react SVG icon to inject a gradient <defs> so CSS-based
 * `stroke: url(#gradient-icon)` works reliably. Provides a safe fallback
 * to currentColor via CSS (see index.css) if gradient paint is unsupported.
 */
export const AnimatedIcon = ({
  children,
  className,
  gradientId = "gradient-icon",
}: {
  children: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  className?: string;
  gradientId?: string;
}) => {
  const defs = (
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--accent))" />
        <stop offset="50%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
  );

  const icon = children as React.ReactElement & { props: { children?: React.ReactNode; className?: string } };

  return cloneElement(
    icon,
    {
      className: [icon.props.className, className, "animated-gradient-stroke"].filter(Boolean).join(" "),
    },
    <>
      {defs}
      {icon.props.children}
    </>,
  );
};

export default AnimatedIcon;
