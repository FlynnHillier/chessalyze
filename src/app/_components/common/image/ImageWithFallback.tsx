"use client";

import { useEffect, useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fallbackSrc?: string;
};

export default function ImageWithFallback({
  fallbackSrc,
  src,
  ...props
}: Props) {
  const [hasErrored, setHasErrored] = useState<boolean>(false);
  const [activeSrc, setActiveSrc] = useState<string>(src);

  useEffect(() => {
    const img = new Image();
    img.onerror = () => {
      setHasErrored(true);
    };
    img.src = activeSrc;
  }, []);

  useEffect(() => {
    if (hasErrored && fallbackSrc !== undefined) setActiveSrc(fallbackSrc);
  }, [hasErrored]);

  return <img {...props} src={activeSrc} />;
}
