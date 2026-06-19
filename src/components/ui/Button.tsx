import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
};

export function Button({ variant = "primary", isLoading, children, className = "", style, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-50";

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--accent)",
      color: "white",
    },
    secondary: {
      backgroundColor: "var(--bg-card)",
      color: "var(--text)",
      border: "1px solid var(--border)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--text-muted)",
    },
  };

  return (
    <button
      {...props}
      disabled={props.disabled || isLoading}
      className={`${base} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
