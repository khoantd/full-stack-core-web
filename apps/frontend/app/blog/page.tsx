import Link from "next/link";
import { Calendar, User, MessageCircle, ArrowRight, Tag, ChevronRight } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BLOG_POSTS } from "@/lib/landing-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Car Parts",
  description: "Latest news, tips, and updates from the Car Parts team.",
};

const CATEGORIES = [
  { name: "Engine Parts", count: 5 },
  { name: "Braking Systems", count: 3 },
  { name: "Suspension", count: 4 },
  { name: "Electrical", count: 2 },
  { name: "Logistics", count: 3 },
  { name: "Accessories", count: 6 },
];

const RECENT_POSTS = BLOG_POSTS.slice(0, 3);

const TAGS = ["Engine", "Brakes", "Suspension", "Delivery", "Trucks", "Performance", "OEM", "Aftermarket"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav />

      {/* Page Header */}
      <div className="relative bg-[#111111] border-b border-white/5 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Business Models you can Consider
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Blog Standard</h1>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-orange-500 transition">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-orange-500">Blog Standard</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Posts list */}
          <div className="lg:col-span-2 space-y-10">
            {BLOG_POSTS.map((post) => (
              <article
                key={post._id}
                className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden group hover:border-orange-500/30 transition-all duration-300"
              >
                {/* Image */}
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
                  <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-5 text-gray-500 text-xs mb-5 border-b border-white/5 pb-5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-orange-500" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-orange-500" />
                      By {post.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-orange-500" />
                      {post.comments} Comments
                    </span>
                  </div>

                  <h2 className="text-white font-extrabold text-xl mb-4 leading-snug group-hover:text-orange-500 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {post.description}
                  </p>

                  <Link
                    href={`/blog/${post._id}`}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded transition"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>
              </article>
            ))}

            {/* Pagination */}
            <div className="flex items-center gap-2 pt-4">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded text-sm font-semibold transition ${
                    page === 1
                      ? "bg-orange-500 text-white"
                      : "bg-[#1a1a1a] border border-white/10 text-gray-400 hover:border-orange-500 hover:text-orange-500"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Categories */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">
                Categories
              </h3>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      href="/blog"
                      className="flex items-center justify-between text-gray-400 hover:text-orange-500 text-sm py-1.5 transition group"
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-orange-500" />
                        {cat.name}
                      </span>
                      <span className="bg-[#111] group-hover:bg-orange-500 group-hover:text-white text-xs px-2 py-0.5 rounded transition">
                        {cat.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">
                Recent Posts
              </h3>
              <ul className="space-y-4">
                {RECENT_POSTS.map((post) => (
                  <li key={post._id}>
                    <Link href="/blog" className="flex gap-3 group">
                      <div className="w-16 h-14 bg-[#111] rounded flex items-center justify-center shrink-0 text-2xl opacity-40">
                        🚗
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium leading-snug group-hover:text-orange-500 transition line-clamp-2">
                          {post.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <Link
                    key={tag}
                    href="/blog"
                    className="flex items-center gap-1 bg-[#111] border border-white/10 text-gray-400 hover:border-orange-500 hover:text-orange-500 text-xs px-3 py-1.5 rounded transition"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
