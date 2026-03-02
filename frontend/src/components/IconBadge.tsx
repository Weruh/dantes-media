import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

type IconBadgeProps = {
  icon: LucideIcon;
  className?: string;
};

const IconBadge = ({ icon: Icon, className }: IconBadgeProps) => (
  <span
    className={cn(
      "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand-dark",
      className
    )}
  >
    <Icon className="h-6 w-6" />
  </span>
);

export default IconBadge;
