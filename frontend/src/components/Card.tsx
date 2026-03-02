import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-white to-[#f3f7ff] p-6 shadow-card",
      className
    )}
    {...props}
  />
);

export default Card;
