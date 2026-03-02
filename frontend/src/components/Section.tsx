import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type SectionProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  className?: string;
};

const Section = ({ title, subtitle, eyebrow, children, className }: SectionProps) => (
  <section className={cn("py-16", className)}>
    <div className="mx-auto max-w-6xl px-4">
      {eyebrow && (
        <div>
          {typeof eyebrow === "string" ? (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark">
              {eyebrow}
            </span>
          ) : (
            eyebrow
          )}
        </div>
      )}
      {title && (
        <h2 className="mt-2 text-3xl font-semibold text-ink-900 md:text-4xl">{title}</h2>
      )}
      {subtitle && <p className="mt-3 max-w-2xl text-base text-ink-500">{subtitle}</p>}
      <div className={cn("mt-10", title || subtitle ? "" : "mt-0")}>{children}</div>
    </div>
  </section>
);

export default Section;
