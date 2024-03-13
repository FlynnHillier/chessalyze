import { useMemo } from "react";

type DotProps = {
  animationDelay?: string;
  customTailwind?: string;
};

type SyncLoaderProps = {
  dotCount?: number;
  customTailwind?: string;
};

function Dot({ animationDelay, customTailwind }: DotProps): JSX.Element {
  return (
    <span
      className={`animate-vertical-wobble inline-block aspect-square h-1/3 rounded-full bg-black ${customTailwind}`}
      style={{
        animationDelay: animationDelay,
      }}
    ></span>
  );
}

export default function SyncLoader({ customTailwind, dotCount = 3 }: SyncLoaderProps) {
  const dots: JSX.Element[] = useMemo(() => {
    const o: JSX.Element[] = [];
    for (let i = 0; i < dotCount; i++)
      o.push(<Dot customTailwind={customTailwind} animationDelay={`-${0.2 * i}s`} />);
    return o;
  }, [dotCount]);

  return (
    <div className="flex h-full w-full flex-row items-center justify-center gap-x-1.5">
      {...dots}
    </div>
  );
}
