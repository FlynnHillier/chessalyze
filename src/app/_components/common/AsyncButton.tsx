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
