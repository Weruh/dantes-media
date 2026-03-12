import { Helmet } from "react-helmet-async";
import Section from "../components/Section";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Badge from "../components/Badge";
import SectionHeading from "../components/SectionHeading";
import SalesCTA from "../components/SalesCTA";
import { ButtonLink } from "../components/Button";
import { productSolutionImageMap, productSolutionsData } from "../data/productSolutionsData";

const Services = () => {
  const navigate = useNavigate();

  const navigateToServiceProducts = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      <Helmet>
        <title>Services | Dantes Media</title>
        <meta
          name="description"
          content="Core ICT services that keep your business connected, protected, and productive."
        />
      </Helmet>

      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/assets/service hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/45 via-ink-900/20 to-transparent" />
        <div className="relative z-10 mx-auto min-h-[360px] max-w-6xl px-4 py-20 md:min-h-[420px] md:py-24 lg:min-h-[480px] lg:py-28">
          <Badge variant="outline" className="border-white/50 bg-ink-900/30 text-white">
            ICT Services
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] md:text-5xl">
            Core Services That Keep You Connected And Protected
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
            We combine infrastructure delivery, security, and ongoing support so your team can operate with confidence.
          </p>
        </div>
      </section>

      <Section>
        <SectionHeading
          title="Security and Infrastructure Categories"
          subtitle="Security categories are listed first, then networking and computing categories follow."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {productSolutionsData.map((solution) => {
            const image = productSolutionImageMap[solution.id] ?? "/assets/consultacy.jpg";
            const productTarget = `/shop?category=${encodeURIComponent(solution.shopCategory)}`;
            return (
              <Card
                key={solution.id}
                role="link"
                tabIndex={0}
                onClick={() => navigateToServiceProducts(solution.shopCategory)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigateToServiceProducts(solution.shopCategory);
                  }
                }}
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden border-white/20 bg-transparent text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                {image && (
                  <img
                    src={encodeURI(image)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-ink-900/75 via-ink-900/55 to-ink-900/20" />
                <div className="relative z-10 flex h-full flex-col">
                  <Badge variant="outline" className="border-white/60 bg-white/10 text-white">
                    {solution.primaryCategory}
                  </Badge>
                  <h3 className="mt-4 text-base font-semibold text-white">{solution.title}</h3>
                  <p className="mt-2 text-sm text-white/85">{solution.intro}</p>
                  <ul className="mt-4 space-y-2 text-xs text-white/80">
                    {solution.highlights.slice(0, 3).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-col gap-2 pt-6">
                    <ButtonLink
                      to={productTarget}
                      variant="secondary"
                      className="border-white/70 text-white hover:border-white/90 hover:text-white hover:bg-white/10"
                      onClick={(event) => event.stopPropagation()}
                    >
                      View products
                    </ButtonLink>
                    <ButtonLink
                      to="/contact?tab=quote&serviceType=General%20Quote"
                      variant="secondary"
                      className="border-white/70 text-white hover:border-white/90 hover:text-white hover:bg-white/10"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Talk to Sales
                    </ButtonLink>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Ready to scope your ICT priorities?"
          subtitle="Talk to Sales or book a site survey to plan your next deployment with Dantes Media."
        />
      </Section>
    </>
  );
};

export default Services;
