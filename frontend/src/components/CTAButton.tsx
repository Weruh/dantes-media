import { ButtonLink } from "./Button";

type CTAButtonProps = {
  label: string;
  to: string;
  className?: string;
};

const CTAButton = ({ label, to, className }: CTAButtonProps) => (
  <ButtonLink to={to} className={className}>
    {label}
  </ButtonLink>
);

export default CTAButton;
