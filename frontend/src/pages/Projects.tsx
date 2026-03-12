import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SalesCTA from "../components/SalesCTA";
import { projectsData } from "../data/projectsData";

const securityProjectKeywords = [
  "security",
  "cctv",
  "access control",
  "hardening",
  "monitoring",
  "intruder",
  "fire",
];

const isSecurityProject = (text: string) =>
  securityProjectKeywords.some((keyword) => text.toLowerCase().includes(keyword));

const Projects = () => {
  const sortedProjects = [...projectsData].sort((a, b) => {
    const aIsSecurity = isSecurityProject(`${a.title} ${a.slug} ${a.summary} ${a.solution}`);
    const bIsSecurity = isSecurityProject(`${b.title} ${b.slug} ${b.summary} ${b.solution}`);

    if (aIsSecurity === bIsSecurity) return a.id - b.id;
    return aIsSecurity ? -1 : 1;
  });

  return (
    <>
      <Helmet>
        <title>Projects | Dantes Media</title>
        <meta name="description" content="Case studies showcasing Dantes Media ICT deployments." />
      </Helmet>

      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/assets/home image.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center 70%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/35 via-ink-900/15 to-transparent" />
        <div className="relative z-10 mx-auto min-h-[360px] max-w-6xl px-4 py-20 md:min-h-[420px] md:py-24 lg:min-h-[480px] lg:py-28">
          <Badge variant="outline" className="border-white/50 bg-ink-900/35 text-white">
            Case Studies
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] md:text-5xl">
            Proven deployments with clear outcomes.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
            Each project combines assessment, secure delivery, and responsive support for long-term reliability.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => {
            const securityFocused = isSecurityProject(
              `${project.title} ${project.slug} ${project.summary} ${project.solution}`
            );

            return (
            <Card key={project.id} className="flex h-full flex-col">
              <div className="overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-56 w-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{project.industry}</Badge>
                  {securityFocused ? (
                    <Badge variant="outline" className="border-brand/30 bg-brand-50 text-brand-dark">
                      Security Priority
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-3 text-base font-semibold text-ink-900">{project.title}</h3>
                <p className={`mt-2 text-ink-500 ${securityFocused ? "text-sm" : "text-xs"}`}>
                  {project.summary}
                </p>
                <div className={`mt-4 space-y-2 text-ink-500 ${securityFocused ? "text-xs" : "text-[11px]"}`}>
                  <p><span className="font-semibold text-ink-700">Challenge:</span> {project.challenge}</p>
                  <p><span className="font-semibold text-ink-700">Solution:</span> {project.solution}</p>
                  <p><span className="font-semibold text-ink-700">Outcome:</span> {project.outcome}</p>
                </div>
              </div>
              <Link
                to={`/projects/${project.slug}`}
                className="mt-4 text-xs font-semibold text-brand-dark"
              >
                View details &rarr;
              </Link>
            </Card>
            );
          })}
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Want similar results?"
          subtitle="Tell us about your facility and we will scope the right solution."
        />
      </Section>
    </>
  );
};

export default Projects;
