import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { ButtonLink, buttonClasses } from "../components/Button";
import { getPillarBySlug } from "../data/pillarsData";

const PillarDetail = () => {
  const { slug } = useParams();
  const pillar = getPillarBySlug(slug);

  if (!pillar) {
    return (
      <Section title="Pillar not found" subtitle="We couldn't locate this page.">
        <Link to="/" className="text-sm font-semibold text-brand-dark">
          Back to home &rarr;
        </Link>
      </Section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pillar.title} | Dantes Media</title>
        <meta name="description" content={pillar.summary} />
      </Helmet>

      <Section>
        <Badge variant="outline">Service Pillar</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink-900 md:text-5xl">{pillar.title}</h1>
        <p className="mt-4 max-w-3xl text-base text-ink-500">{pillar.description}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <h2 className="text-xl font-semibold text-ink-900">What this covers</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-500">
              {pillar.highlights.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold text-ink-900">Typical work included</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-500">
              {pillar.services.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        title="Recent work visuals"
        subtitle="A quick look at real installations and delivery work."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pillar.gallery.map((image) => (
            <Card
              key={image}
              className={`overflow-hidden p-0 ${pillar.slug === "security-systems" ? "rounded-none" : ""}`}
            >
              <img
                src={image}
                alt=""
                aria-hidden="true"
                className="h-56 w-full object-cover object-top md:h-60"
                loading="lazy"
                decoding="async"
              />
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Book or call for this service">
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-ink-900">Let’s plan your next step</h3>
            <p className="mt-2 text-sm text-ink-500">
              Share your site needs and we’ll recommend the right scope and timeline.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to={`/contact?tab=survey&serviceType=${pillar.ctaServiceType}`}>
              Book a Site Survey
            </ButtonLink>
            <a href="tel:+254715578015" className={buttonClasses("outline")}>
              Call +254 (715) 578-015
            </a>
          </div>
        </Card>
      </Section>
    </>
  );
};

export default PillarDetail;
