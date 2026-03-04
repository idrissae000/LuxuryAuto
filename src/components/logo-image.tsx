"use client";

import { useState } from "react";

type LogoImageProps = {
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export function LogoImage({ alt, width, height, className }: LogoImageProps) {
  const [src, setSrc] = useState("/logo.png");

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setSrc("/logo.svg")}
    />
  );
}
