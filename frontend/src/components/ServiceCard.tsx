import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import Card from "./Card";
import IconBadge from "./IconBadge";
import { iconMap } from "./iconMap";
import type { IconName } from "./iconMap";
import { cn } from "../utils/cn";

type ServiceCardProps = {
  title: string;
  description: string;
  slug: string;
  iconName: IconName;
  linkTo?: string;
  linkLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  className?: string;
};

const ServiceCard = ({
  title,
  description,
  slug,
  iconName,
  linkTo,
  linkLabel,
  imageSrc,
  imageAlt,
  imageClassName,
  imageStyle,
  className,
}: ServiceCardProps) => {
  const Icon = iconMap[iconName];
  const destination = linkTo ?? `/services/${slug}`;
  const label = linkLabel ?? "View details ->";

  return (
    <Link to={destination} className="group block h-full">
      <Card className={cn("flex h-full flex-col gap-4 rounded-none transition hover:border-brand", className)}>
        <div className="-mx-6 -mt-6 overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt ?? title}
              className={cn("h-56 w-full object-cover", imageClassName)}
              loading="lazy"
              decoding="async"
              style={imageStyle}
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-slate-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Image Placeholder
            </div>
          )}
        </div>
        <IconBadge icon={Icon} />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          <p className="mt-2 text-xs text-ink-500">{description}</p>
        </div>
        <span className="text-xs font-semibold text-brand-dark group-hover:text-ink-900">
          {label}
        </span>
      </Card>
    </Link>
  );
};

export default ServiceCard;
