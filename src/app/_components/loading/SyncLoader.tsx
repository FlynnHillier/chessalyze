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
      className={`block aspect-square w-2 animate-vertical-wobble rounded-full bg-black ${customTailwind}`}
      style={{
        animationDelay: animationDelay,
      }}
    ></span>
  );
}

export default function SyncLoader({
  customTailwind,
  dotCount = 3,
}: SyncLoaderProps) {
  const dots: JSX.Element[] = useMemo(() => {
    const o: JSX.Element[] = [];
    for (let i = 0; i < dotCount; i++)
      o.push(
        <Dot
          key={i}
          customTailwind={customTailwind}
          animationDelay={`-${0.2 * i}s`}
        />,
      );
    return o;
  }, [dotCount]);

  return (
    <div className="relative inline-block h-full w-full flex-row items-center gap-x-1.5">
      <div className="align flex h-fit w-full flex-row items-center justify-center gap-1">
        &nbsp;{...dots}
      </div>
    </div>
  );
}
