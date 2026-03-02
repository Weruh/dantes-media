import { Minus, Plus } from "lucide-react";
import { cn } from "../utils/cn";

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  className?: string;
};

const QuantityStepper = ({ value, onChange, min = 1, className }: QuantityStepperProps) => (
  <div className={cn("inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2", className)}>
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="rounded-full p-1 text-ink-600 hover:bg-slate-100"
      aria-label="Decrease quantity"
    >
      <Minus className="h-4 w-4" />
    </button>
    <span className="min-w-[24px] text-center text-sm font-semibold text-ink-900">{value}</span>
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      className="rounded-full p-1 text-ink-600 hover:bg-slate-100"
      aria-label="Increase quantity"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);

export default QuantityStepper;
