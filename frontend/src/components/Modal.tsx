import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

const Modal = ({ open, onClose, title, children, className }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl", className)}>
        <div className="flex items-center justify-between">
          {title && <h3 className="text-xl font-semibold text-ink-900">{title}</h3>}
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-ink-600"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
