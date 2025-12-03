import React, { CSSProperties } from "react";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;      // color of the arc
  shimmerSize?: string;       // thickness of the ring (e.g. "2px")
  borderRadius?: string;      // radius of the button (e.g. "12px")
  shimmerDuration?: string;   // rotation duration (e.g. "2.5s")
  background?: string;        // button background
  className?: string;
  children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "rgba(46,196,182,0.95)",
      shimmerSize = "2px",
      borderRadius = "12px",
      shimmerDuration = "2.5s",
      background = "rgba(10,10,10,1)",
      className,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    // CSS variables we will expose to inline style
    const cssVars: CSSProperties = {
      ["--shimmer-color" as any]: shimmerColor,
      ["--shimmer-size" as any]: shimmerSize,
      ["--radius" as any]: borderRadius,
      ["--shimmer-speed" as any]: shimmerDuration,
      ["--btn-bg" as any]: background,
      // ensure a sensible default padding so the inner cover sits right
    };

    return (
      <button
        ref={ref}
        {...props}
        style={{ ...cssVars, ...(style as object) } as CSSProperties}
        className={
          "relative z-0 inline-flex items-center justify-center overflow-hidden " +
          "whitespace-nowrap select-none rounded-[var(--radius)] px-5 py-2 " +
          "transition-transform duration-150 ease-in-out active:translate-y-px " +
          (className || "")
        }
      >
        {/* Rotating ring layer (behind the center but visible as ring due to inner cover) */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none shimmer-ring"
          style={{
            // padding creates the ring thickness (we set it equal to shimmer-size)
            padding: "var(--shimmer-size)",
            borderRadius: `calc(var(--radius) + var(--shimmer-size))`,
            // keep it behind content but above background
            zIndex: 0,
            display: "block",
          }}
        >
          {/* gradient element which rotates */}
          <span
            className="block w-full h-full rounded-[calc(var(--radius) + var(--shimmer-size))] animate-shimmer-rotate"
            style={{
              // a small arc (6deg) gives a thin premium-looking line
              background:
                "conic-gradient(from 0deg, var(--shimmer-color) 0deg, transparent 6deg, transparent 100%)",
            }}
          />
        </span>

        {/* The inner cover hides the center of the gradient, leaving a ring */}
        <span
          aria-hidden
          className="absolute inset-[var(--shimmer-size)] rounded-[var(--radius)] pointer-events-none"
          style={{
            background: "var(--btn-bg)",
            zIndex: 1,
          }}
        />

        {/* Button inner highlight/content layer (on top) */}
        <span
          className="relative z-10 flex items-center justify-center"
          style={{
            // keep the inner content area matching the background so the ring appears outside it
            borderRadius: "var(--radius)",
            color: "inherit",
          }}
        >
          {children}
        </span>
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
