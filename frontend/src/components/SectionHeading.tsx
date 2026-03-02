import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

const SectionHeading = ({ eyebrow, title, subtitle, align = "left", className }: SectionHeadingProps) => (
  <div
    className={cn(
      "space-y-3",
      align === "center" ? "text-center" : "text-left",
      className
    )}
  >
    {eyebrow && (
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark">
        {eyebrow}
      </div>
    )}
    <h2 className="text-3xl font-semibold text-ink-900 md:text-4xl">{title}</h2>
    {subtitle && <p className="text-base text-ink-500">{subtitle}</p>}
  </div>
);

export default SectionHeading;
