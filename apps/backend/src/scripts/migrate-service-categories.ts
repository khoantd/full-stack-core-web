import 'reflect-metadata';

import mongoose, { type Model, type Types } from 'mongoose';
import { Service, ServiceSchema } from '../service/schemas/service.schema';
import { ServiceCategory, ServiceCategorySchema, ServiceCategoryStatus } from '../service-category/schemas/service-category.schema';

function getModel<T>(name: string, schema: mongoose.Schema): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema);
}

function requireEnvOneOf(names: string[]): string {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  throw new Error(`Missing required env var. Provide one of: ${names.join(', ')}`);
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

async function ensureUniqueSlug(
  ServiceCategoryModel: Model<ServiceCategory>,
  tenantId: string,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug || 'category';
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await ServiceCategoryModel.exists({ tenantId, slug }).exec();
    if (!exists) return slug;
    slug = `${baseSlug}-${i}`;
    i += 1;
  }
}

async function main() {
  const uri = requireEnvOneOf(['MONGODB_URI', 'MONGO_URI']);
  await mongoose.connect(uri);

  const ServiceModel = getModel<Service>('Service', ServiceSchema);
  const ServiceCategoryModel = getModel<ServiceCategory>('ServiceCategory', ServiceCategorySchema);

  const tenants = await ServiceModel.distinct('tenantId', { category: { $exists: true, $ne: '' } });

  let createdCategories = 0;
  let linkedServices = 0;

  for (const tenantIdRaw of tenants) {
    const tenantId = String(tenantIdRaw);

    const categories: string[] = await ServiceModel.distinct('category', { tenantId, category: { $exists: true, $ne: '' } });
    for (const nameRaw of categories) {
      const name = String(nameRaw).trim();
      if (!name) continue;

      const baseSlug = slugify(name);
      let existing = await ServiceCategoryModel.findOne({ tenantId, name }).exec();
      if (!existing) {
        const slug = await ensureUniqueSlug(ServiceCategoryModel, tenantId, baseSlug);
        existing = await ServiceCategoryModel.create({
          tenantId,
          name,
          slug,
          status: ServiceCategoryStatus.PUBLISHED,
          sortOrder: 0,
        });
        createdCategories += 1;
      }

      const res = await ServiceModel.updateMany(
        {
          tenantId,
          category: name,
          $or: [{ categoryIds: { $exists: false } }, { categoryIds: { $size: 0 } }],
        },
        {
          $set: { categoryIds: [(existing._id as Types.ObjectId)] },
        },
      ).exec();

      linkedServices += res.modifiedCount ?? 0;
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        tenantsTouched: tenants.length,
        createdCategories,
        linkedServices,
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

