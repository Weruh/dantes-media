import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import IconBadge from "../components/IconBadge";
import SalesCTA from "../components/SalesCTA";
import { postsData, postCategories, type PostCategory } from "../data/postsData";
import { HeartPulse, ShieldCheck, Timer, Users } from "lucide-react";

const categoryIconMap: Record<PostCategory, typeof Timer> = {
  Productivity: Timer,
  "Burnout Prevention": HeartPulse,
  "Digital Safety Habits": ShieldCheck,
  "Team Systems": Users,
};

const cardPalettes = [
  {
    card: "border-t-sky-300/70 bg-gradient-to-br from-sky-50 via-white to-sky-100/70",
    iconWrap: "bg-sky-100/70 ring-1 ring-sky-200/70",
    iconBadge: "bg-sky-100 text-sky-600",
    badge: "bg-sky-100/70 text-sky-700",
  },
  {
    card: "border-t-violet-300/70 bg-gradient-to-br from-violet-50 via-white to-violet-100/70",
    iconWrap: "bg-violet-100/70 ring-1 ring-violet-200/70",
    iconBadge: "bg-violet-100 text-violet-700",
    badge: "bg-violet-100/70 text-violet-700",
  },
  {
    card: "border-t-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-amber-100/70",
    iconWrap: "bg-amber-100/70 ring-1 ring-amber-200/70",
    iconBadge: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100/70 text-amber-800",
  },
  {
    card: "border-t-emerald-300/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70",
    iconWrap: "bg-emerald-100/70 ring-1 ring-emerald-200/70",
    iconBadge: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100/70 text-emerald-700",
  },
  {
    card: "border-t-rose-300/70 bg-gradient-to-br from-rose-50 via-white to-rose-100/70",
    iconWrap: "bg-rose-100/70 ring-1 ring-rose-200/70",
    iconBadge: "bg-rose-100 text-rose-700",
    badge: "bg-rose-100/70 text-rose-700",
  },
  {
    card: "border-t-teal-300/70 bg-gradient-to-br from-teal-50 via-white to-teal-100/70",
    iconWrap: "bg-teal-100/70 ring-1 ring-teal-200/70",
    iconBadge: "bg-teal-100 text-teal-700",
    badge: "bg-teal-100/70 text-teal-700",
  },
];

const SelfCare = () => {
  const [category, setCategory] = useState<PostCategory | "All">("All");

  const filteredPosts = useMemo(() => {
    if (category === "All") return postsData;
    return postsData.filter((post) => post.category === category);
  }, [category]);

  return (
    <>
      <Helmet>
        <title>Self Care Services | Dantes Media</title>
        <meta
          name="description"
          content="Self-care resources to help teams stay productive, safe, and aligned."
        />
      </Helmet>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Badge variant="outline">Self-Care Hub</Badge>
          <h1 className="mt-4 text-4xl font-semibold text-ink-900 md:text-5xl">
            Work Better. Stress Less. Stay Sharp.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-ink-500">
            Short resources designed to keep your team productive, safe, and aligned between support visits.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCategory("All")}
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                category === "All" ? "border-brand bg-brand/20 text-ink-900" : "border-slate-200 text-ink-600"
              }`}
            >
              All
            </button>
            {postCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                  category === item ? "border-brand bg-brand/20 text-ink-900" : "border-slate-200 text-ink-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => {
            const Icon = categoryIconMap[post.category];
            const styles = cardPalettes[index % cardPalettes.length];
            return (
            <Card key={post.slug} className={`flex h-full flex-col border-t-2 ${styles.card}`}>
              <div className={`flex items-center justify-center rounded-2xl py-8 ${styles.iconWrap}`}>
                <IconBadge icon={Icon} className={`h-12 w-12 rounded-xl ${styles.iconBadge}`} />
              </div>
              <div className="mt-4">
                <Badge className={styles.badge}>{post.category}</Badge>
                <h3 className="mt-3 text-lg font-semibold text-ink-900">{post.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{post.excerpt}</p>
                <p className="mt-3 text-xs text-ink-400">{post.date} | {post.readTime}</p>
              </div>
              <Link to={`/self-care/${post.slug}`} className="mt-4 text-xs font-semibold text-brand-dark">
                Read article &rarr;
              </Link>
            </Card>
          )})}
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Need hands-on support?"
          subtitle="Book a site survey or talk to Sales to pair self-care resources with expert delivery."
        />
      </Section>
    </>
  );
};

export default SelfCare;
