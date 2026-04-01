import Link from "next/link";
import { Calendar, User, ChevronRight, Tag, ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingData, getPublicBlogById, getPublicBlogs } from "@/services/landing.service";
import { blogAuthor, formatBlogDate } from "@/lib/blog-display";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublicBlogById(id);
  return {
    title: post ? `${post.title} - Blog` : "Blog",
    description: post?.description?.slice(0, 160),
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, landing, recentRes] = await Promise.all([
    getPublicBlogById(id),
    getLandingData(),
    getPublicBlogs(1, 10),
  ]);

  if (!post) notFound();

  const { config = {} } = landing;
  const relatedPosts = recentRes.data.filter((p) => p._id !== post._id).slice(0, 2);
  const recentPosts = recentRes.data.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav config={config} />

      <div className="relative bg-[#111111] border-b border-white/5 py-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--accent-500)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-500)" }}>
            {config.siteName ?? "Blog"}
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-4 line-clamp-2">{post.title}</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
            <Link href="/" className="transition hover:opacity-80" style={{ color: "var(--accent-500)" }}>
              Home
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href="/blog" className="transition hover:opacity-80" style={{ color: "var(--accent-500)" }}>
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1" style={{ color: "var(--accent-500)" }}>
              Article
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <article className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden">
              <div className="relative h-80 bg-[#111] flex items-center justify-center overflow-hidden">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-9xl opacity-10">🚗</div>
                )}
                <span
                  className="absolute top-4 left-4 text-white text-xs font-semibold px-3 py-1 rounded"
                  style={{ backgroundColor: "var(--accent-500)" }}
                >
                  News
                </span>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-5 text-gray-500 text-xs border-b border-white/5 pb-5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                    {formatBlogDate(post)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                    By {blogAuthor(post)}
                  </span>
                </div>

                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.description}</div>

                <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-6">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Tags:</span>
                  <Link
                    href="/blog"
                    className="flex items-center gap-1 bg-[#111] border border-white/10 text-gray-400 text-xs px-3 py-1 rounded transition hover:[color:var(--accent-500)] hover:[border-color:var(--accent-500)]"
                  >
                    <Tag className="h-3 w-3" />
                    News
                  </Link>
                </div>
              </div>
            </article>

            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6 flex gap-5 items-start">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
                style={{ backgroundColor: "var(--accent-500)" }}
              >
                {blogAuthor(post).charAt(0)}
              </div>
              <div>
                <h4 className="text-white font-bold text-base mb-1">{blogAuthor(post)}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Author for {config.siteName ?? "this site"}. Contact us via the site footer if you have questions
                  about this article.
                </p>
              </div>
            </div>

            {relatedPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <h3 className="sm:col-span-2 text-white font-extrabold text-lg">More posts</h3>
                {relatedPosts.map((related) => (
                  <Link
                    key={related._id}
                    href={`/blog/${related._id}`}
                    className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden group hover:[border-color:color-mix(in_srgb,var(--accent-500)_30%,transparent)] transition-all duration-300"
                  >
                    <div className="h-40 bg-[#111] flex items-center justify-center overflow-hidden">
                      {related.image ? (
                        <img
                          src={related.image}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-5xl opacity-10">🚗</div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--accent-500)" }}>
                        News
                      </p>
                      <h5 className="text-white font-bold text-sm leading-snug transition-colors line-clamp-2 group-hover:[color:var(--accent-500)]">
                        {related.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">
                Latest posts
              </h3>
              <ul className="space-y-4">
                {recentPosts.map((p) => (
                  <li key={p._id}>
                    <Link href={`/blog/${p._id}`} className="flex gap-3 group">
                      <div className="w-16 h-14 bg-[#111] rounded flex items-center justify-center shrink-0 text-2xl opacity-40 overflow-hidden">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : "🚗"}
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatBlogDate(p)}
                        </p>
                        <p className="text-white text-sm font-medium leading-snug transition line-clamp-2 group-hover:[color:var(--accent-500)]">
                          {p.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg p-6 space-y-4" style={{ backgroundColor: "var(--accent-500)" }}>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Questions?</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Reach us using the contact details in the footer, or return to the home page.
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 text-white text-sm font-semibold bg-[#0d0d0d] hover:bg-[#1a1a1a] px-6 py-2.5 rounded transition"
              >
                Contact
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <LandingFooter config={config} />
    </div>
  );
}
