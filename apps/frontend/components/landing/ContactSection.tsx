"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import type { LandingConfig } from "@/services/landing.service";

interface Props {
  config?: LandingConfig;
}

export function ContactSection({ config }: Props) {
  const contactInfo = [
    { icon: Phone, label: "Phone", value: config?.phone || "+1 543-705-8174" },
    { icon: Mail, label: "Email", value: config?.email || "support@carparts.com" },
    { icon: MapPin, label: "Address", value: config?.address || "123 Auto Drive, Detroit, MI 48201" },
    { icon: Clock, label: "Hours", value: config?.hours || "Mon–Sat: 8am – 6pm" },
  ];
  return (
    <section id="contact" className="py-20 bg-[#111111]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-500)" }}>
              Get In Touch
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              Contact Us
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Have a question about a part or need help with your order? Our team is ready to assist you.
            </p>
            <div className="space-y-6">
              {contactInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--accent-500) 10%, transparent)" }}>
                    <Icon className="h-5 w-5" style={{ color: "var(--accent-500)" }} />
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">{label}</div>
                    <div className="text-white text-sm font-medium">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-8">
            <h3 className="text-white font-bold text-xl mb-6">Send a Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5" htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-[#111] border border-white/10 rounded px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-[#111] border border-white/10 rounded px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/40 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5" htmlFor="contact-subject">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="How can we help?"
                  className="w-full bg-[#111] border border-white/10 rounded px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/40 transition"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-1.5" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Tell us more..."
                  className="w-full bg-[#111] border border-white/10 rounded px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/40 transition resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full text-white font-semibold py-3 rounded transition cursor-pointer"
                style={{ backgroundColor: "var(--accent-500)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-600)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-500)")}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
