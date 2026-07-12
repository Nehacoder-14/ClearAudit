"use client";

import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeStyles = {
    sm: "h-4 w-4 border-[2px]",
    md: "h-6 w-6 border-[2px]",
    lg: "h-10 w-10 border-[3px]",
  };

  return (
    <div
      className={`${sizeStyles[size]} rounded-full border-[#EADFCF] border-t-[#4B1218] animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
