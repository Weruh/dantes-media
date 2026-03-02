import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type AlertProps = {
  tone?: "success" | "error" | "info";
  children: ReactNode;
  className?: string;
};

const Alert = ({ tone = "info", children, className }: AlertProps) => (
  <div
    className={cn(
      "rounded-2xl border px-4 py-3 text-sm",
      tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
      tone === "error" && "border-red-200 bg-red-50 text-red-700",
      tone === "info" && "border-slate-200 bg-slate-50 text-ink-600",
      className
    )}
  >
    {children}
  </div>
);

export default Alert;
