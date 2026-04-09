import 'reflect-metadata';

import mongoose, { type Model, type Types } from 'mongoose';
import { Blog, BlogSchema, BlogStatus } from '../blog/schemas/blog.schema';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';

type SereneMockPost = {
  title: string;
  excerpt: string;
  date: string; // e.g. "December 23, 2025"
};

const TENANT_SLUG = 'triinity';

const POSTS: SereneMockPost[] = [
  {
    title: 'Sound Therapy vs Traditional Sleep Aids: What to Know',
    date: 'December 23, 2025',
    excerpt:
      'Explore the differences between natural sound therapy and traditional sleep medications, and discover which approach may work best for you.',
  },
  {
    title: 'Gentle Ways to Prepare Your Body for Better Sleep',
    date: 'December 23, 2025',
    excerpt:
      "Learn simple, calming rituals you can incorporate into your nightly routine to signal your body that it's time to rest.",
  },
  {
    title: 'Why Your Nervous System Struggles to Sleep at Night',
    date: 'January 16, 2025',
    excerpt:
      'Understanding the science behind an overactive nervous system and how it impacts your ability to fall and stay asleep.',
  },
  {
    title: 'The Role of Breathwork in Deep Relaxation',
    date: 'January 10, 2025',
    excerpt:
      'Discover how controlled breathing techniques can activate your parasympathetic nervous system and promote restful sleep.',
  },
  {
    title: 'How Singing Bowls Can Transform Your Sleep Quality',
    date: 'December 5, 2024',
    excerpt:
      'Tibetan singing bowls have been used for centuries. Learn how their resonant frequencies can help you achieve deeper sleep.',
  },
  {
    title: 'Creating the Perfect Sleep Environment at Home',
    date: 'November 28, 2024',
    excerpt:
      'From lighting to temperature, explore practical tips for designing a bedroom that supports healthy, restorative sleep.',
  },
];

function getModel<T>(name: string, schema: mongoose.Schema): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema);
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var: ${name}`);
  return v.trim();
}

function parsePublishedAt(dateStr: string): Date | undefined {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

async function main() {
  const uri = requireEnv('MONGODB_URI');

  await mongoose.connect(uri);

  const TenantModel = getModel<Tenant>('Tenant', TenantSchema);
  const BlogModel = getModel<Blog>('Blog', BlogSchema);

  const tenant = await TenantModel.findOne({ slug: TENANT_SLUG }).exec();
  if (!tenant) {
    throw new Error(`Tenant not found for slug: ${TENANT_SLUG}`);
  }

  const tenantId = (tenant._id as Types.ObjectId).toString();

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const p of POSTS) {
    const publishedAt = parsePublishedAt(p.date);

    const existing = await BlogModel.findOne({ tenantId, title: p.title }).exec();
    if (!existing) {
      await BlogModel.create({
        tenantId,
        title: p.title,
        description: p.excerpt,
        status: BlogStatus.PUBLISHED,
        publishedAt,
        author: 'Serene Site',
        seoTitle: p.title,
        seoDescription: p.excerpt,
      });
      created += 1;
      continue;
    }

    const next = {
      description: p.excerpt,
      status: BlogStatus.PUBLISHED,
      publishedAt,
      author: existing.author ?? 'Serene Site',
      seoTitle: existing.seoTitle ?? p.title,
      seoDescription: existing.seoDescription ?? p.excerpt,
    };

    const changed =
      existing.description !== next.description ||
      existing.status !== next.status ||
      String(existing.publishedAt ?? '') !== String(next.publishedAt ?? '');

    if (!changed) {
      unchanged += 1;
      continue;
    }

    existing.description = next.description;
    existing.status = next.status;
    existing.publishedAt = next.publishedAt;
    existing.author = next.author;
    existing.seoTitle = next.seoTitle;
    existing.seoDescription = next.seoDescription;

    await existing.save();
    updated += 1;
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        tenant: { slug: TENANT_SLUG, id: tenantId },
        results: { total: POSTS.length, created, updated, unchanged },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });

