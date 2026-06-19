import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
};

export function Button({ variant = "primary", isLoading, children, className = "", ...props }: Props) {
  const variantClass = variant === "primary" ? "pixel-btn-primary" : "";
  return (
    <button
      {...props}
      disabled={props.disabled || isLoading}
      className={`pixel-btn ${variantClass} ${className}`}
      style={{ fontSize: "9px", ...props.style }}
    >
      {isLoading ? (
        <span className="blink">█</span>
      ) : null}
      {children}
    </button>
  );
}
