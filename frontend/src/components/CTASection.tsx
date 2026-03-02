import type { ReactNode } from "react";
import { ButtonLink } from "./Button";
import { cn } from "../utils/cn";

type CTASectionProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  className?: string;
  children?: ReactNode;
};

const CTASection = ({ title, subtitle, ctaLabel, ctaLink, className, children }: CTASectionProps) => (
  <div className={cn("rounded-3xl border border-slate-100 bg-slate-50 p-8", className)}>
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
      <ButtonLink to={ctaLink} className="w-full shrink-0 whitespace-nowrap md:w-auto">
        {ctaLabel}
      </ButtonLink>
    </div>
  </div>
);

export default CTASection;
