"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-[#EADFCF]";

  const variantStyles = {
    text: "rounded-md",
    rectangular: "rounded-xl",
    circular: "rounded-full",
  };

  const sizeStyles: React.CSSProperties = {};
  if (width) sizeStyles.width = width;
  if (height) sizeStyles.height = height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={sizeStyles}
    />
  );
}
