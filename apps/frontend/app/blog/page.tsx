import Link from "next/link";
import { Calendar, User, ArrowRight, Tag, ChevronRight } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingData, getPublicBlogs } from "@/services/landing.service";
import { blogAuthor, formatBlogDate } from "@/lib/blog-display";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest news, tips, and updates.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const limit = 10;

  const [landing, list, recentRes] = await Promise.all([
    getLandingData(),
    getPublicBlogs(page, limit),
    getPublicBlogs(1, 3),
  ]);

  const { config = {} } = landing;
  const { data: posts, pagination } = list;
  const recentPosts = recentRes.data;

  const { totalPages, hasNextPage, hasPrevPage } = pagination;

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
          <h1 className="text-4xl font-extrabold text-white mb-4">Blog</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="transition hover:opacity-80" style={{ color: "var(--accent-500)" }}>
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span style={{ color: "var(--accent-500)" }}>Blog</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {posts.length === 0 ? (
              <p className="text-gray-400 text-sm">No published posts yet.</p>
            ) : (
              posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden group transition-all duration-300 hover:[border-color:color-mix(in_srgb,var(--accent-500)_30%,transparent)]"
                >
                  <div className="relative h-64 bg-[#111] flex items-center justify-center overflow-hidden">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-8xl opacity-10">🚗</div>
                    )}
                    <span
                      className="absolute top-4 left-4 text-white text-xs font-semibold px-3 py-1 rounded"
                      style={{ backgroundColor: "var(--accent-500)" }}
                    >
                      News
                    </span>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-wrap items-center gap-5 text-gray-500 text-xs mb-5 border-b border-white/5 pb-5">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                        {formatBlogDate(post)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                        By {blogAuthor(post)}
                      </span>
                    </div>

                    <h2 className="text-white font-extrabold text-xl mb-4 leading-snug transition-colors group-hover:[color:var(--accent-500)]">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-4">{post.description}</p>

                    <Link
                      href={`/blog/${post._id}`}
                      className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded transition hover:opacity-90"
                      style={{ backgroundColor: "var(--accent-500)" }}
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            )}

            {totalPages > 1 && (
              <div className="flex items-center gap-2 pt-4 flex-wrap">
                {hasPrevPage && (
                  <Link
                    href={`/blog?page=${pagination.page - 1}`}
                    className="px-3 py-2 rounded text-sm text-gray-400 border border-white/10 hover:[border-color:var(--accent-500)] hover:[color:var(--accent-500)] transition"
                  >
                    Previous
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blog?page=${p}`}
                    className={
                      p === pagination.page
                        ? "w-10 h-10 rounded text-sm font-semibold transition flex items-center justify-center text-white"
                        : "w-10 h-10 rounded text-sm font-semibold transition flex items-center justify-center text-gray-400 border border-white/10 hover:[border-color:var(--accent-500)] hover:[color:var(--accent-500)]"
                    }
                    style={p === pagination.page ? { backgroundColor: "var(--accent-500)" } : undefined}
                  >
                    {p}
                  </Link>
                ))}
                {hasNextPage && (
                  <Link
                    href={`/blog?page=${pagination.page + 1}`}
                    className="px-3 py-2 rounded text-sm text-gray-400 border border-white/10 hover:[border-color:var(--accent-500)] hover:[color:var(--accent-500)] transition"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">
                Recent Posts
              </h3>
              {recentPosts.length === 0 ? (
                <p className="text-gray-500 text-sm">No posts yet.</p>
              ) : (
                <ul className="space-y-4">
                  {recentPosts.map((post) => (
                    <li key={post._id}>
                      <Link href={`/blog/${post._id}`} className="flex gap-3 group">
                        <div className="w-16 h-14 bg-[#111] rounded flex items-center justify-center shrink-0 text-2xl opacity-40 overflow-hidden">
                          {post.image ? (
                            <img src={post.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            "🚗"
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium leading-snug transition line-clamp-2 group-hover:[color:var(--accent-500)]">
                            {post.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatBlogDate(post)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">
                Topics
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Posts are managed in your dashboard. Publish with status &quot;Published&quot; to show them here.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 mt-4 text-xs font-semibold transition hover:opacity-80"
                style={{ color: "var(--accent-500)" }}
              >
                <Tag className="h-3 w-3" />
                All posts
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <LandingFooter config={config} />
    </div>
  );
}
