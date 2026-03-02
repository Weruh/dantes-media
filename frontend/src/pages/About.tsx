import { Helmet } from "react-helmet-async";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SalesCTA from "../components/SalesCTA";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | Dantes Media</title>
        <meta
          name="description"
          content="Learn about Dantes Media, our mission, values, and ICT delivery process."
        />
      </Helmet>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Badge variant="outline">About Dantes Media</Badge>
          <h1 className="mt-4 text-4xl font-semibold text-ink-900 md:text-5xl">
            Secure Infrastructure. Reliable Systems. Responsive Support.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-ink-500">
            We partner with growing businesses to deliver secure ICT infrastructure, dependable systems, and fast support
            that scales with every stage of growth.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <h3 className="text-xl font-semibold text-ink-900">Mission</h3>
            <p className="mt-3 text-sm text-ink-500">
              Help businesses operate confidently with secure networks, dependable systems, and technology guidance that
              scales.
            </p>
            <h3 className="mt-6 text-xl font-semibold text-ink-900">What we do</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li>- Structured cabling, Wi-Fi design, and network optimization</li>
              <li>- CCTV, access control, and perimeter security integration</li>
              <li>- Server room setup, monitoring, and business continuity planning</li>
              <li>- PBX/VoIP rollout, endpoint setup, and productivity tooling</li>
            </ul>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-ink-900">Values</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li>- Reliability in every deployment</li>
              <li>- Transparent communication</li>
              <li>- Scalable, future-ready design</li>
              <li>- Commitment to uptime</li>
            </ul>
            <h3 className="mt-6 text-lg font-semibold text-ink-900">Industries supported</h3>
            <p className="mt-2 text-sm text-ink-500">
              Professional services, manufacturing, retail, education, healthcare, and financial services.
            </p>
          </Card>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Survey", detail: "We diagnose gaps in connectivity, security, and operations." },
            { title: "Design", detail: "We propose a secure plan with scope, timelines, and cost controls." },
            { title: "Install", detail: "We deploy on-site with documented testing and sign-off." },
            { title: "Test", detail: "We validate performance, access control, and monitoring." },
            { title: "Handover", detail: "We train your team and deliver documentation." },
            { title: "Support", detail: "We maintain systems through monitoring and responsive help." },
          ].map((step) => (
            <Card key={step.title} className="flex h-full flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark">{step.title}</p>
              <p className="mt-3 text-sm text-ink-500">{step.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Ready to partner with Dantes Media?"
          subtitle="Talk to Sales or book a site survey and we will map your next upgrade."
        />
      </Section>
    </>
  );
};

export default About;
