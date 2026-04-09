import 'reflect-metadata';

import mongoose, { type Model, type Types } from 'mongoose';
import { Service, ServiceSchema, ServiceStatus } from '../service/schemas/service.schema';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';

type SereneMockService = {
  title: string;
  description: string;
};

const TENANT_SLUG = 'triinity';

const DEFAULTS = {
  status: ServiceStatus.PUBLISHED,
  price: 0,
  duration: '60 min',
  category: 'Sleep Therapy',
} as const;

const SERVICES: SereneMockService[] = [
  {
    title: 'Personalized Sleep Therapy Sessions',
    description: 'Tailored sessions designed to address your unique sleep patterns and restore natural rest.',
  },
  {
    title: 'Insomnia & Sleep Anxiety Support',
    description: 'Gentle, non-invasive techniques to calm racing thoughts and ease nighttime anxiety.',
  },
  {
    title: 'Guided Sound Healing for Deep Rest',
    description: 'Therapeutic frequencies and singing bowls that guide your body into deep relaxation.',
  },
  {
    title: 'Nervous System Regulation Therapy',
    description: 'Restore balance to your nervous system so rest comes naturally.',
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

async function main() {
  const uri = requireEnv('MONGODB_URI');

  await mongoose.connect(uri);

  const TenantModel = getModel<Tenant>('Tenant', TenantSchema);
  const ServiceModel = getModel<Service>('Service', ServiceSchema);

  const tenant = await TenantModel.findOne({ slug: TENANT_SLUG }).exec();
  if (!tenant) {
    throw new Error(`Tenant not found for slug: ${TENANT_SLUG}`);
  }

  const tenantId = (tenant._id as Types.ObjectId).toString();

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const s of SERVICES) {
    const existing = await ServiceModel.findOne({ tenantId, title: s.title }).exec();
    if (!existing) {
      await ServiceModel.create({
        tenantId,
        title: s.title,
        description: s.description,
        status: DEFAULTS.status,
        price: DEFAULTS.price,
        duration: DEFAULTS.duration,
        category: DEFAULTS.category,
        seoTitle: s.title,
        seoDescription: s.description,
      });
      created += 1;
      continue;
    }

    const next = {
      description: s.description,
      status: DEFAULTS.status,
      price: DEFAULTS.price,
      duration: DEFAULTS.duration,
      category: DEFAULTS.category,
      seoTitle: existing.seoTitle ?? s.title,
      seoDescription: existing.seoDescription ?? s.description,
    };

    const changed =
      existing.description !== next.description ||
      existing.status !== next.status ||
      existing.price !== next.price ||
      existing.duration !== next.duration ||
      existing.category !== next.category;

    if (!changed) {
      unchanged += 1;
      continue;
    }

    existing.description = next.description;
    existing.status = next.status;
    existing.price = next.price;
    existing.duration = next.duration;
    existing.category = next.category;
    existing.seoTitle = next.seoTitle;
    existing.seoDescription = next.seoDescription;

    await existing.save();
    updated += 1;
  }

  const totalInTenant = await ServiceModel.countDocuments({ tenantId });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        tenant: { slug: TENANT_SLUG, id: tenantId },
        defaults: DEFAULTS,
        results: { total: SERVICES.length, created, updated, unchanged },
        tenantServiceCount: totalInTenant,
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

