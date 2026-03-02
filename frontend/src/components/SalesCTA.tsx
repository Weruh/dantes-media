import { ButtonLink } from "./Button";
import { cn } from "../utils/cn";

type SalesCTAProps = {
  title: string;
  subtitle: string;
  className?: string;
};

const SalesCTA = ({ title, subtitle, className }: SalesCTAProps) => (
  <div className={cn("rounded-3xl border border-slate-100 bg-white p-8 shadow-card", className)}>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
      <div>
        <h3 className="text-2xl font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3">
        <ButtonLink to="/contact?tab=quote&serviceType=General%20Quote">Request A View</ButtonLink>
        <ButtonLink to="/contact?tab=survey" variant="secondary">
          Book A Site Survey
        </ButtonLink>
        <ButtonLink to="/shop" variant="outline">
          Shop Products
        </ButtonLink>
      </div>
    </div>
  </div>
);

export default SalesCTA;
