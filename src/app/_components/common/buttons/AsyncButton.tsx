import { ReactNode } from "react";

type Props = JSX.IntrinsicElements["button"] & {
  isLoading: boolean;
  onLoading: ReactNode;
  customTailwind?: {
    enabled?: string;
    disabled?: string;
  };
};

export default function AsyncButton({
  disabled,
  isLoading,
  customTailwind,
  onLoading,
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${className} ${!disabled && !isLoading ? customTailwind?.enabled : ""} ${disabled || isLoading ? customTailwind?.disabled : ""}`}
    >
      {isLoading ? onLoading : children}
    </button>
  );
}

export function FixedSizeAsyncButton({
  isLoading,
  onLoading,
  children,
  ...otherProps
}: {
  isLoading: boolean;
  onLoading: ReactNode;
} & JSX.IntrinsicElements["button"]) {
  return (
    <button {...otherProps} disabled={otherProps.disabled || isLoading}>
      <div className="relative">
        <div
          className={`inline-block h-fit w-fit ${isLoading ? " invisible" : ""}`}
        >
          {children}
        </div>
        <div
          className={`absolute left-0 top-0 flex h-full w-full items-center justify-center ${!isLoading ? "invisible" : ""}`}
        >
          {onLoading}
        </div>
      </div>
    </button>
  );
}
