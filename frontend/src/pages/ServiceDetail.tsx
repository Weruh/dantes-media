import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import FeatureList from "../components/FeatureList";
import CTASection from "../components/CTASection";
import SalesCTA from "../components/SalesCTA";
import { servicesData } from "../data/servicesData";

const processSteps = ["Survey", "Design", "Install", "Test", "Handover", "Support"];

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = servicesData.find((item) => item.slug === slug);

  if (!service) {
    return (
      <Section title="Service not found" subtitle="We couldn't locate this service.">
        <Link to="/services" className="text-sm font-semibold text-brand-dark">
          Back to Services &rarr;
        </Link>
      </Section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service.title} | Dantes Media</title>
        <meta name="description" content={service.shortDesc} />
      </Helmet>

      <Section>
        <div className="text-sm text-ink-500">
          <Link to="/" className="hover:text-ink-900">
            Home
          </Link>{" "}
          /{" "}
          <Link to="/services" className="hover:text-ink-900">
            Services
          </Link>{" "}
          / <span className="text-ink-900">{service.title}</span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-ink-900 md:text-4xl">{service.title}</h1>
        <p className="mt-3 max-w-3xl text-base text-ink-500">{service.shortDesc}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <Card>
              <h2 className="text-xl font-semibold text-ink-900">Overview</h2>
              <p className="mt-2 text-sm text-ink-500">
                {service.shortDesc} Our team delivers secure, scalable outcomes aligned to your
                operational needs.
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-ink-900">Who It's For</h2>
              <FeatureList items={service.whoItsFor} />
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-ink-900">What We Deliver</h2>
              <FeatureList items={service.deliverables} />
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-ink-900">Process</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink-500">
                {processSteps.map((step) => (
                  <span key={step} className="rounded-full border border-slate-200 px-3 py-1">
                    {step}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-ink-900">FAQ</h2>
              <div className="mt-4 space-y-4 text-sm text-ink-600">
                {service.faqs.map((faq) => (
                  <div key={faq.question}>
                    <p className="font-semibold text-ink-900">{faq.question}</p>
                    <p className="mt-1 text-ink-500">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <CTASection
              title="Talk to Sales"
              subtitle="Share your requirements and receive a tailored proposal."
              ctaLabel="Talk to Sales"
              ctaLink="/contact?tab=quote&serviceType=General%20Quote"
            />
            <CTASection
              title="Book A Site Survey"
              subtitle="Let our team assess your environment and plan the delivery."
              ctaLabel="Book A Site Survey"
              ctaLink="/contact?tab=survey"
            />
          </div>
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Need help scoping this service?"
          subtitle="Talk to Sales or book a site survey to align requirements and timelines."
        />
      </Section>
    </>
  );
};

export default ServiceDetail;
