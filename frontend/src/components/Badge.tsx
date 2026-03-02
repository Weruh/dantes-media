import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type BadgeProps = {
  children: ReactNode;
  variant?: "solid" | "soft" | "outline";
  className?: string;
};

const Badge = ({ children, variant = "soft", className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      variant === "solid" && "bg-brand text-ink-900",
      variant === "soft" && "bg-slate-100 text-ink-700",
      variant === "outline" && "border border-slate-200 text-ink-700",
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
