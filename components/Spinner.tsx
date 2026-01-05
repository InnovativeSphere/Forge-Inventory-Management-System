"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";

type LoaderSize = "xs" | "sm" | "md" | "lg";
type LoaderTone = "default" | "accent";

interface LoaderProps {
  size?: LoaderSize;
  tone?: LoaderTone;
  className?: string;
}

const sizeStyles: Record<LoaderSize, string> = {
  xs: "h-3 w-3 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[3px]",
  lg: "h-10 w-10 border-4",
};

// Default tones act as base; accent will override dynamically
const baseToneStyles: Record<LoaderTone, string> = {
  default: "border-[var(--color-muted)] border-t-[var(--color-foreground)]",
  accent: "border-[var(--color-accent)/30] border-t-[var(--color-accent)]",
};

// Colors to cycle through (can add more)
const cycleColors = [
  "var(--color-accent)",
  "var(--color-accent-hover)",
  "var(--color-foreground)",
  "var(--color-muted)",
];

export function Spinner({
  size = "md",
  tone = "default",
  className,
}: LoaderProps) {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % cycleColors.length);
    }, 2000); // 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Dynamic border color
  const dynamicTone =
    tone === "accent"
      ? `border-[${cycleColors[colorIndex]}/30] border-t-[${cycleColors[colorIndex]}]`
      : baseToneStyles[tone];

  return (
    <span
      aria-label="Loading"
      className={clsx(
        "inline-block rounded-full animate-spin transition-colors duration-700 ease-in-out",
        sizeStyles[size],
        dynamicTone,
        className
      )}
    />
  );
}
