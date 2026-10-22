import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-fairway-600 text-white hover:bg-fairway-700 shadow-sm",
  secondary: "bg-ink-900 text-white hover:bg-ink-700",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-ink-300 text-ink-700 hover:border-ink-900 bg-white",
};
const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>(
  function Button({ variant = "primary", size = "md", className, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-fairway-500/50", variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
