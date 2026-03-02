import { CheckCircle2 } from "lucide-react";

const FeatureList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 text-sm text-ink-600">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-dark" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default FeatureList;
