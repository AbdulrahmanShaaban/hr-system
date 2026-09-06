"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  children: React.ReactNode;
  className?: string;
  fadeColor?: string;
}

export function ScrollIndicator({ children, className, fadeColor = "var(--card)" }: ScrollIndicatorProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = React.useState(false);
  const [canScrollEnd, setCanScrollEnd] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function check() {
      setCanScrollStart(el!.scrollLeft > 2);
      setCanScrollEnd(el!.scrollLeft + el!.clientWidth < el!.scrollWidth - 2);
    }

    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {canScrollStart && (
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-8"
          style={{ background: `linear-gradient(to left, transparent, ${fadeColor})` }}
        />
      )}
      {canScrollEnd && (
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-8"
          style={{ background: `linear-gradient(to right, transparent, ${fadeColor})` }}
        />
      )}
      <div ref={ref} className="overflow-x-auto scrollbar-hide">
        {children}
      </div>
    </div>
  );
}
