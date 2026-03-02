import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import Section from "../components/Section";
import Badge from "../components/Badge";
import SalesCTA from "../components/SalesCTA";
import { projectsData } from "../data/projectsData";

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = projectsData.find((item) => item.slug === slug);

  if (!project) {
    return (
      <Section title="Project not found" subtitle="We couldn't locate this case study.">
        <Link to="/projects" className="text-sm font-semibold text-brand-dark">
          Back to Projects &rarr;
        </Link>
      </Section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} | Dantes Media</title>
        <meta name="description" content={project.summary} />
      </Helmet>

      <Section>
        <div className="text-sm text-ink-500">
          <Link to="/projects" className="hover:text-ink-900">Projects</Link> /{" "}
          <span className="text-ink-900">{project.title}</span>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-72 overflow-hidden rounded-none bg-slate-100 md:h-80 lg:h-96">
            <img src={project.image} alt={project.title} className="h-full w-full object-cover object-top" />
          </div>
          <div>
            <Badge variant="outline">{project.industry}</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-ink-900 md:text-4xl">{project.title}</h1>
            <p className="mt-3 text-base text-ink-500">{project.summary}</p>
            <div className="mt-6 space-y-4 text-sm text-ink-500">
              <p><span className="font-semibold text-ink-700">Challenge:</span> {project.challenge}</p>
              <p><span className="font-semibold text-ink-700">Solution:</span> {project.solution}</p>
              <p><span className="font-semibold text-ink-700">Outcome:</span> {project.outcome}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Ready for a similar outcome?"
          subtitle="Talk to Sales or book a site survey to plan your next deployment."
        />
      </Section>
    </>
  );
};

export default ProjectDetail;
