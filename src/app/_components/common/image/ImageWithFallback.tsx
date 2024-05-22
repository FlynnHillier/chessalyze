"use client";

import { useEffect, useRef, useState, ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "onError" | "onLoad"> & {
  fallbackSrc?: string;
};

export default function ImageWithFallback({
  fallbackSrc,
  src,
  ...restProps
}: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const img = ref.current;
    if (!img) return;

    img.onload = () => {
      setStatus("success");
    };

    img.onerror = (event) => {
      setStatus("error");
      if (fallbackSrc) img.src = fallbackSrc;
    };

    setStatus("loading");
    if (src) img.src = src;
  }, [ref, src, fallbackSrc]);

  return (
    <img
      ref={ref}
      {...restProps}
      style={{
        ...restProps.style,
        visibility:
          status === "loading" ? "hidden" : restProps.style?.visibility,
      }}
    />
  );
}
