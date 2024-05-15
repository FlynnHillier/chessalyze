"use client";

import { useEffect, useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError"> & {
  src: string;
  fallbackSrc?: string;
};

export default function ImageWithFallback({
  fallbackSrc,
  src,
  ...restProps
}: Props) {
  const [activeSrc, setActiveSrc] = useState<string | undefined>(src);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  useEffect(() => {
    const dummy = new Image();

    dummy.onerror = () => {
      if (fallbackSrc) setActiveSrc(fallbackSrc);
    };

    dummy.onload = () => {
      setHasLoaded(true);
    };

    dummy.src = src;
  }, [src]);

  useEffect(() => {
    if (activeSrc && activeSrc === src) return;

    setActiveSrc(fallbackSrc);
  }, [fallbackSrc]);

  return (
    <img
      {...restProps}
      style={{
        visibility:
          !hasLoaded && activeSrc !== fallbackSrc
            ? "hidden"
            : restProps.style?.visibility,
        ...restProps.style,
      }}
      src={activeSrc}
      onLoad={() => {
        setHasLoaded(true);
      }}
    />
  );
}
