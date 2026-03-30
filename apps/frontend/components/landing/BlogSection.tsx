import Link from "next/link";
import { Calendar, User, MessageCircle, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/landing-data";

export function BlogSection() {
  return (
    <section id="blog" className="py-20 bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>
            Latest News
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            From Our Blog
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post._id}
              className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden group hover:border-white/20 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-52 bg-[#111] flex items-center justify-center overflow-hidden">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-6xl opacity-20">🚗</div>
                )}
                {/* Category badge */}
                <span className="absolute top-4 left-4 text-white text-xs font-semibold px-3 py-1 rounded" style={{ backgroundColor: "var(--accent-500)" }}>
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                    {post.comments}
                  </span>
                </div>

                <h3 className="text-white font-bold text-lg mb-3 leading-snug group-hover:opacity-70 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">
                  {post.description}
                </p>

                <Link
                  href={`/blog/${post._id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-70 cursor-pointer"
                  style={{ color: "var(--accent-500)" }}
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-semibold px-8 py-3 rounded transition-all duration-200 cursor-pointer border hover:bg-[var(--accent-500)] hover:text-white"
            style={{ borderColor: "var(--accent-500)", color: "var(--accent-500)" }}
          >
            View All Posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
