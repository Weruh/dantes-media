import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

export const buttonClasses = (variant: ButtonVariant, className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
    variant === "primary" &&
      "bg-brand text-ink-900 shadow-sm hover:bg-brand-dark hover:text-ink-900",
    variant === "secondary" &&
      "border border-slate-200 text-ink-700 hover:border-slate-300 hover:text-ink-900",
    variant === "outline" &&
      "border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white",
    variant === "ghost" && "text-ink-700 hover:text-ink-900",
    className
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = ({ variant = "primary", className, ...props }: ButtonProps) => (
  <button className={buttonClasses(variant, className)} {...props} />
);

type ButtonLinkProps = {
  to: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

export const ButtonLink = ({ to, variant = "primary", className, children }: ButtonLinkProps) => (
  <Link to={to} className={buttonClasses(variant, className)}>
    {children}
  </Link>
);
