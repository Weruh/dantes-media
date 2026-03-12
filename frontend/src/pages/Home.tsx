import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import IconBadge from "../components/IconBadge";
import SectionHeading from "../components/SectionHeading";
import SalesCTA from "../components/SalesCTA";
import { Button, ButtonLink } from "../components/Button";
import { projectsData } from "../data/projectsData";
import { postsData, type PostCategory } from "../data/postsData";
import { productSolutionImageMap, productSolutionsData } from "../data/productSolutionsData";
import { testimonialsData } from "../data/testimonialsData";
import { useCart } from "../app/cart/CartContext";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { HeartPulse, ShieldCheck, Timer, Users } from "lucide-react";

const categoryIconMap: Record<PostCategory, typeof Timer> = {
  Productivity: Timer,
  "Burnout Prevention": HeartPulse,
  "Digital Safety Habits": ShieldCheck,
  "Team Systems": Users,
};

const categoryStyleMap: Record<
  PostCategory,
  { card: string; iconBadge: string; badge: string }
> = {
  Productivity: {
    card: "border-t-sky-300/70 bg-gradient-to-br from-sky-50 via-white to-sky-100/70",
    iconBadge: "bg-sky-100 text-sky-600",
    badge: "bg-sky-100/70 text-sky-700",
  },
  "Team Systems": {
    card: "border-t-violet-300/70 bg-gradient-to-br from-violet-50 via-white to-violet-100/70",
    iconBadge: "bg-violet-100 text-violet-700",
    badge: "bg-violet-100/70 text-violet-700",
  },
  "Burnout Prevention": {
    card: "border-t-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-amber-100/70",
    iconBadge: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100/70 text-amber-800",
  },
  "Digital Safety Habits": {
    card: "border-t-emerald-300/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70",
    iconBadge: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100/70 text-emerald-700",
  },
};

const HOME_SERVICE_PRIORITY = [
  "cctv-cameras-accessories",
  "networking-products-accessories",
];

const HERO_SERVICES = [
  "Internet/Fibre",
  "Networking",
  "CCTV",
  "Electric Fence & Alarm System",
  "Access Control and Time Attendance Systems",
  "Burglar Alarm Systems and Accessories",
  "Networking Products and Accessories",
  "Computer Accessories",
];

const Home = () => {
  const navigate = useNavigate();
  const { products, loading: catalogLoading } = useCatalogProducts();
  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured),
    [products]
  );
  const serviceCards = useMemo(() => {
    const prioritized = productSolutionsData.filter((solution) =>
      HOME_SERVICE_PRIORITY.includes(solution.id)
    );
    const remaining = productSolutionsData.filter(
      (solution) => !HOME_SERVICE_PRIORITY.includes(solution.id)
    );

    return [...prioritized, ...remaining].map((solution) => ({
      ...solution,
      image: productSolutionImageMap[solution.id] ?? "/assets/consultacy.jpg",
    }));
  }, []);
  const { addItem } = useCart();

  const navigateToServiceProducts = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      <Helmet>
        <title>Dantes Media | ICT Services</title>
        <meta
          name="description"
          content="Dantes Media delivers secure ICT infrastructure, product sales, networking, security, and support services for growing businesses."
        />
        <meta property="og:title" content="Dantes Media | ICT Services" />
        <meta
          property="og:description"
          content="Secure networks, reliable systems, and responsive ICT support."
        />
      </Helmet>

      <section
        className="relative flex min-h-[72vh] items-center overflow-hidden text-white md:min-h-[84vh]"
        style={{
          backgroundImage: "url('/assets/hero%202.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/55 via-ink-900/30 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
          <h1 className="max-w-5xl text-lg font-semibold leading-[1.1] sm:text-xl md:text-3xl">
            <span className="block">Powering homes & businesses with smart technology.</span>
          </h1>
          <ul className="mt-5 max-w-5xl list-disc space-y-3 pl-6 text-base font-semibold text-white/95 marker:text-white sm:text-lg md:text-2xl">
            {HERO_SERVICES.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      </section>

      <Section>
        <SectionHeading
          title="Services"
          subtitle="Browse all service categories from our Services page."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {serviceCards.map((solution) => {
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
                className="group relative flex min-h-[500px] cursor-pointer flex-col overflow-hidden border-white/20 bg-transparent p-5 text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:min-h-[460px] sm:p-6"
              >
                <img
                  src={encodeURI(solution.image)}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-ink-900/75 via-ink-900/55 to-ink-900/20" />
                <div className="relative z-10 flex h-full min-h-0 flex-col">
                  <Badge variant="outline" className="w-fit border-white/60 bg-white/10 text-white">
                    {solution.primaryCategory}
                  </Badge>
                  <h3 className="mt-4 max-h-[3.5rem] overflow-hidden text-base font-semibold text-white">{solution.title}</h3>
                  <p className="mt-2 max-h-24 overflow-hidden text-sm text-white/85">{solution.intro}</p>
                  <ul className="mt-4 space-y-1.5 text-[11px] text-white/80 sm:text-xs">
                    {solution.highlights.slice(0, 3).map((item, itemIndex) => (
                      <li key={item} className={itemIndex === 2 ? "hidden sm:list-item" : ""}>
                        - {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-col gap-2 pt-6">
                    <ButtonLink
                      to={productTarget}
                      variant="secondary"
                      className="border-white/70 text-white hover:border-white/90 hover:bg-white/10 hover:text-white"
                      onClick={(event) => event.stopPropagation()}
                    >
                      View products
                    </ButtonLink>
                    <ButtonLink
                      to="/contact?tab=quote&serviceType=General%20Quote"
                      variant="secondary"
                      className="border-white/70 text-white hover:border-white/90 hover:bg-white/10 hover:text-white"
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
        <SectionHeading title="Featured products" subtitle="Best-selling hardware and security gear ready for deployment." />
        {catalogLoading ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-ink-500">
            Loading featured products...
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="no-scrollbar mt-10 flex gap-6 overflow-x-auto pb-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-[260px]">
                <Card className="flex h-full flex-col overflow-hidden rounded-none p-0 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="block h-40 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm font-semibold text-ink-900">{product.name}</p>
                    <p className="mt-1 text-xs text-ink-500">{product.shortDesc}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Link
                        to={`/shop/${product.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark whitespace-nowrap"
                      >
                        <span>View</span>
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-0 text-xs font-semibold whitespace-nowrap tracking-normal"
                        onClick={() => addItem(product)}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-ink-500">
            No featured products available right now.
          </div>
        )}
      </Section>

      <Section>
        <SectionHeading title="Projects" subtitle="Recent deployments with clear outcomes." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {projectsData.slice(0, 3).map((project) => {
            const image = project.image;
            return (
              <Card key={project.id} className="group relative min-h-[360px] overflow-hidden p-0 md:min-h-[420px]">
                <img
                  src={encodeURI(image)}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-ink-900/55 via-ink-900/35 to-ink-900/15" />
                <div className="relative z-10 flex h-full flex-col p-6 text-white">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="mt-2 text-sm text-white/80">
                    <span className="font-semibold text-white/90">Outcome:</span> {project.outcome}
                  </p>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="mt-auto text-xs font-semibold text-white"
                  >
                    View details &rarr;
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section>
        <SectionHeading title="Self-care resources" subtitle="Quick wins to keep teams productive between support visits." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {postsData.slice(0, 3).map((post) => {
            const Icon = categoryIconMap[post.category];
            const styles = categoryStyleMap[post.category];
            return (
              <Card key={post.slug} className={`flex h-full flex-col border-t-2 ${styles.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <IconBadge icon={Icon} className={`h-11 w-11 rounded-xl ${styles.iconBadge}`} />
                  <Badge className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${styles.badge}`}>
                    {post.category}
                  </Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{post.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{post.excerpt}</p>
                <Link to={`/self-care/${post.slug}`} className="mt-auto text-xs font-semibold text-brand-dark">
                  Read article &rarr;
                </Link>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section>
        <SectionHeading title="What clients say" subtitle="Proof of delivery, support, and reliability." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonialsData.map((item) => (
            <Card key={item.name}>
              <p className="text-sm text-ink-500">"{item.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-ink-900">{item.name}</p>
              <p className="text-xs text-ink-500">{item.role}, {item.company}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Ready to plan your next ICT upgrade?"
          subtitle="Talk to Sales, book a site survey, or shop products to get started today."
        />
      </Section>
    </>
  );
};

export default Home;
