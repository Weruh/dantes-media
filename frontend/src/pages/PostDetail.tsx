import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import Section from "../components/Section";
import Badge from "../components/Badge";
import SalesCTA from "../components/SalesCTA";
import { postsData } from "../data/postsData";

const PostDetail = () => {
  const { slug } = useParams();
  const post = postsData.find((item) => item.slug === slug);

  if (!post) {
    return (
      <Section title="Article not found" subtitle="We couldn't locate this resource.">
        <Link to="/self-care" className="text-sm font-semibold text-brand-dark">
          Back to Self-Care &rarr;
        </Link>
      </Section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Dantes Media</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <Section>
        <div className="text-sm text-ink-500">
          <Link to="/self-care" className="hover:text-ink-900">Self-Care</Link> /{" "}
          <span className="text-ink-900">{post.title}</span>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-80 overflow-hidden bg-slate-100 md:h-96">
            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
          </div>
          <div>
            <Badge variant="outline">{post.category}</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-ink-900 md:text-4xl">{post.title}</h1>
            <p className="mt-2 text-sm text-ink-500">{post.date} | {post.readTime}</p>
            <p className="mt-4 text-base text-ink-500">{post.excerpt}</p>
            <div className="mt-6 space-y-4 text-sm text-ink-500">
              {post.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Need expert support alongside your team?"
          subtitle="Talk to Sales to pair self-care resources with managed ICT services. We'll take it from here."
        />
      </Section>
    </>
  );
};

export default PostDetail;
