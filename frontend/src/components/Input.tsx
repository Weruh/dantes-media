import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

type FieldProps = {
  children: ReactNode;
  label?: string;
  error?: string;
};

const Field = ({ children, label, error }: FieldProps) => (
  <label className="space-y-2 text-sm text-ink-700">
    {label && <span className="font-semibold text-ink-700">{label}</span>}
    {children}
    {error && <span className="text-xs text-red-500">{error}</span>}
  </label>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <Field label={label} error={error}>
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-800 focus:border-brand-dark focus:outline-none",
          error && "border-red-400",
          className
        )}
        {...props}
      />
    </Field>
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <Field label={label} error={error}>
      <textarea
        ref={ref}
        className={cn(
          "min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-800 focus:border-brand-dark focus:outline-none",
          error && "border-red-400",
          className
        )}
        {...props}
      />
    </Field>
  )
);
Textarea.displayName = "Textarea";

export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    children: ReactNode;
  }
>(({ label, error, className, children, ...props }, ref) => (
  <Field label={label} error={error}>
    <select
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-800 focus:border-brand-dark focus:outline-none",
        error && "border-red-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  </Field>
));
SelectField.displayName = "SelectField";
