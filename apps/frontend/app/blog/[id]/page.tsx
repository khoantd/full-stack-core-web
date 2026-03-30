import Link from "next/link";
import {
  Calendar,
  User,
  MessageCircle,
  ChevronRight,
  Tag,
  ArrowRight,
  Reply,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BLOG_POSTS } from "@/lib/landing-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const CATEGORIES = [
  { name: "Engine Parts", count: 5 },
  { name: "Braking Systems", count: 3 },
  { name: "Suspension", count: 4 },
  { name: "Electrical", count: 2 },
  { name: "Logistics", count: 3 },
  { name: "Accessories", count: 6 },
];

const TAGS = [
  "Warehouses", "Transport", "Business", "Logistic",
  "Cargo", "Maintenance", "Consulting",
];

const COMMENTS = [
  {
    id: "1",
    name: "James Carter",
    date: "March 25, 2025",
    avatar: "JC",
    content: "Perspiciatis unde omnis iste natus error sit voluptatem accusantium laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    id: "2",
    name: "Maria Lopez",
    date: "March 26, 2025",
    avatar: "ML",
    content: "Perspiciatis unde omnis iste natus error sit voluptatem accusantium laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = BLOG_POSTS.find((p) => p._id === id);
  return {
    title: post ? `${post.title} - Blog` : "Blog Details",
    description: post?.description,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = BLOG_POSTS.find((p) => p._id === id);
  if (!post) notFound();

  const relatedPosts = BLOG_POSTS.filter((p) => p._id !== post._id).slice(0, 2);
  const recentPosts = BLOG_POSTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <LandingNav />

      {/* Page Header */}
      <div className="relative bg-[#111111] border-b border-white/5 py-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--accent-500)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-500)" }}>
            Business Models you can Consider
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Blog Details</h1>
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="transition hover:opacity-80" style={{ color: "var(--accent-500)" }}>Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="transition hover:opacity-80" style={{ color: "var(--accent-500)" }}>Blog</Link>
            <ChevronRight className="h-4 w-4" />
            <span style={{ color: "var(--accent-500)" }}>Blog Details</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Article */}
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
                  {post.category}
                </span>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-5 text-gray-500 text-xs border-b border-white/5 pb-5">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                    By {post.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                    {post.comments} Comments
                  </span>
                </div>

                <h2 className="text-white font-extrabold text-2xl sm:text-3xl leading-snug">{post.title}</h2>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {post.description} Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla.
                  Aliquam quis purus in justo pulvinar tempor. Aliquam tellus nulla, sollicitudin at euismod nec,
                  feugiat at nisi. Quisque vitae odio nec lacus interdum tempus.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis purus
                  in justo pulvinar tempor. Aliquam tellus nulla, sollicitudin at euismod nec, feugiat at nisi.
                  Quisque vitae interdum tempus. Phasellus a rhoncus erat. Vivamus vel eros vitae est aliquet
                  pellentesque vitae et nunc.
                </p>

                <blockquote className="border-l-4 bg-[#111] pl-6 py-4 pr-4 rounded-r-lg" style={{ borderColor: "var(--accent-500)" }}>
                  <p className="text-gray-300 text-sm italic leading-relaxed">
                    "Supply chain excellence is not just about moving goods — it's about delivering trust, reliability, and value at every step of the journey."
                  </p>
                </blockquote>

                <p className="text-gray-400 text-sm leading-relaxed">
                  Aliquam quis purus in justo pulvinar tempor. Aliquam tellus nulla, sollicitudin at euismod nec,
                  feugiat at nisi. Quisque vitae odio nec lacus interdum tempus. Phasellus a rhoncus erat.
                </p>

                {/* Tags and Share */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Tags:</span>
                    {["Logistics", "Cargo", "Blog"].map((t) => (
                      <Link
                        key={t}
                        href="/blog"
                        className="flex items-center gap-1 bg-[#111] border border-white/10 text-gray-400 text-xs px-3 py-1 rounded transition hover:[color:var(--accent-500)] hover:[border-color:var(--accent-500)]"
                      >
                        <Tag className="h-3 w-3" />
                        {t}
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Share:</span>
                    <a href="#" aria-label="Facebook" className="w-8 h-8 rounded bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 transition hover:[background-color:var(--accent-500)] hover:[border-color:var(--accent-500)] hover:text-white">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="#" aria-label="Twitter" className="w-8 h-8 rounded bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 transition hover:[background-color:var(--accent-500)] hover:[border-color:var(--accent-500)] hover:text-white">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </a>
                    <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 transition hover:[background-color:var(--accent-500)] hover:[border-color:var(--accent-500)] hover:text-white">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </article>

            {/* Author Box */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6 flex gap-5 items-start">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
                style={{ backgroundColor: "var(--accent-500)" }}
              >
                {post.author.charAt(0)}
              </div>
              <div>
                <h4 className="text-white font-bold text-base mb-1">{post.author}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Lacinia amet nisi ullamcorper eu suspendisse. Mattis nisl dignissim accumsan consectetur suspendisse amet. Expert in automotive parts and supply chain logistics.
                </p>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related._id}
                    href={`/blog/${related._id}`}
                    className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden group hover:[border-color:color-mix(in_srgb,var(--accent-500)_30%,transparent)] transition-all duration-300"
                  >
                    <div className="h-40 bg-[#111] flex items-center justify-center overflow-hidden">
                      {related.image ? (
                        <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-5xl opacity-10">🚗</div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--accent-500)" }}>{related.category}</p>
                      <h5 className="text-white font-bold text-sm leading-snug transition-colors line-clamp-2 group-hover:[color:var(--accent-500)]">
                        {related.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="space-y-6">
              <h3 className="text-white font-extrabold text-xl border-b border-white/5 pb-4">Recent Comments</h3>
              {COMMENTS.map((comment) => (
                <div key={comment.id} className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6 flex gap-4">
                  <div
                    className="w-12 h-12 rounded-full border flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent-500) 20%, transparent)",
                      borderColor: "color-mix(in srgb, var(--accent-500) 30%, transparent)",
                      color: "var(--accent-500)",
                    }}
                  >
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-bold text-sm">{comment.name}</h5>
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{comment.content}</p>
                    <button className="flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-80 cursor-pointer" style={{ color: "var(--accent-500)" }}>
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a Comment */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-8 space-y-5">
              <h3 className="text-white font-extrabold text-xl border-b border-white/5 pb-4">Leave A Comment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" className="bg-[#111] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:[border-color:var(--accent-500)] transition" />
                <input type="email" placeholder="Your Email" className="bg-[#111] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:[border-color:var(--accent-500)] transition" />
              </div>
              <input type="text" placeholder="Subject" className="w-full bg-[#111] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:[border-color:var(--accent-500)] transition" />
              <textarea rows={5} placeholder="Your Comment" className="w-full bg-[#111] border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:[border-color:var(--accent-500)] transition resize-none" />
              <button
                className="inline-flex items-center gap-2 text-white text-sm font-semibold px-8 py-3 rounded transition hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "var(--accent-500)" }}
              >
                Post Comment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Latest Post */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">Latest Post</h3>
              <ul className="space-y-4">
                {recentPosts.map((p) => (
                  <li key={p._id}>
                    <Link href={`/blog/${p._id}`} className="flex gap-3 group">
                      <div className="w-16 h-14 bg-[#111] rounded flex items-center justify-center shrink-0 text-2xl opacity-40 overflow-hidden">
                        {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : "🚗"}
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {p.date}
                        </p>
                        <p className="text-white text-sm font-medium leading-snug transition line-clamp-2 group-hover:[color:var(--accent-500)]">{p.title}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">Categories</h3>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <Link href="/blog" className="flex items-center justify-between text-gray-400 text-sm py-1.5 transition group hover:[color:var(--accent-500)]">
                      <span className="flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--accent-500)" }} />
                        {cat.name}
                      </span>
                      <span className="bg-[#111] text-xs px-2 py-0.5 rounded transition group-hover:[background-color:var(--accent-500)] group-hover:text-white">
                        {cat.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Query Box */}
            <div className="rounded-lg p-6 space-y-4" style={{ backgroundColor: "var(--accent-500)" }}>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Have Any Query?</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
              </p>
              <input type="text" placeholder="Your message..." className="w-full bg-white/10 border border-white/20 rounded px-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white transition" />
              <button className="w-full bg-[#0d0d0d] hover:bg-[#1a1a1a] text-white text-sm font-semibold py-2.5 rounded transition cursor-pointer">
                Send Message
              </button>
            </div>

            {/* Tags */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/5">Tags Post</h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <Link key={tag} href="/blog" className="flex items-center gap-1 bg-[#111] border border-white/10 text-gray-400 text-xs px-3 py-1.5 rounded transition hover:[color:var(--accent-500)] hover:[border-color:var(--accent-500)]">
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
