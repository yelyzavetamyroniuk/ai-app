import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
};

export function Button({ variant = "primary", isLoading, children, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      disabled={props.disabled || isLoading}
      className={`pixel-btn ${variant === "primary" ? "pixel-btn-cta" : ""} ${className}`}
      style={{ fontSize: "15px", ...props.style }}
    >
      {isLoading && <span className="blink" style={{ marginRight: "6px" }}>█</span>}
      {children}
    </button>
  );
}
