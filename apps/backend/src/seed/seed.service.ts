import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { CategoryProduct, CategoryProductDocument } from '../category-product/schemas/category-product.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Blog } from '../blog/schemas/blog.schema';
import { BlogVersion } from '../blog/schemas/blog-version.schema';
import { Service } from '../service/schemas/service.schema';
import { Role } from '../auth/schemas/role.schema';
import { User } from '../auth/schemas/user.schema';
import { TenantMembership, TenantMembershipDocument } from '../tenant-membership/schemas/tenant-membership.schema';
import {
  TestimonialSection,
  TestimonialSectionDocument,
  TestimonialSectionStatus,
} from '../testimonial-section/schemas/testimonial-section.schema';

const SEED_ROLES = ['admin', 'user', 'staff'];

const SEED_TESTIMONIAL_SECTION_SLUG = 'home-testimonials';

const SEED_TESTIMONIAL_SECTION = {
  eyebrow: 'Testimonials',
  title: 'What Our Clients Say',
  slug: SEED_TESTIMONIAL_SECTION_SLUG,
  status: TestimonialSectionStatus.PUBLISHED,
  items: [
    {
      name: 'Hannah Morales',
      role: 'Business Manager',
      text:
        'After just a few sessions, I noticed a dramatic shift in my sleep quality. I feel more rested and present than I have in years.',
      rating: 5,
      order: 0,
    },
    {
      name: 'Kurt Thompson',
      role: 'Software Engineer',
      text:
        'The sound healing sessions were transformative. I went from waking up multiple times a night to sleeping through peacefully.',
      rating: 4,
      order: 1,
    },
    {
      name: 'Drew Feig',
      role: 'Teacher',
      text:
        'I was skeptical at first, but the gentle, personalized approach won me over. Truly life-changing therapy.',
      rating: 3,
      order: 2,
    },
  ],
};

const SEED_CATEGORIES = [
  { name: 'Engine Parts', description: 'High-performance engine components for all makes and models.' },
  { name: 'Braking Systems', description: 'Reliable brake pads, rotors, and calipers for safe stopping.' },
  { name: 'Suspension', description: 'Shocks, struts, and springs for a smooth ride.' },
  { name: 'Electrical', description: 'Batteries, alternators, and wiring harnesses.' },
  { name: 'Exhaust Systems', description: 'Performance exhausts and catalytic converters.' },
  { name: 'Accessories', description: 'Interior and exterior accessories for every vehicle.' },
];

const SEED_PRODUCTS = [
  { name: 'Car Wheel With Rotor', description: 'High-quality wheel and rotor assembly for reliable braking performance.', price: 18000, stock: 25, sku: 'BWR-001', categoryName: 'Braking Systems' },
  { name: 'Child Car Seat', description: 'Safety-certified child car seat with adjustable harness and side-impact protection.', price: 50000, stock: 15, sku: 'ACC-002', categoryName: 'Accessories' },
  { name: 'Car Seat', description: 'Ergonomic car seat with lumbar support and durable upholstery.', price: 45000, stock: 10, sku: 'ACC-003', categoryName: 'Accessories' },
  { name: 'Tire Pressure Gauge', description: 'Digital tire pressure gauge with backlit display and auto-off feature.', price: 35000, stock: 50, sku: 'ACC-004', categoryName: 'Accessories' },
  { name: 'Disc Brake', description: 'Heavy-duty disc brake rotor for superior stopping power and heat dissipation.', price: 200000, stock: 8, sku: 'BRK-005', categoryName: 'Braking Systems' },
  { name: 'BMW Boosted Engine', description: 'Remanufactured BMW turbocharged engine, fully tested and ready to install.', price: 117000, stock: 3, sku: 'ENG-006', categoryName: 'Engine Parts' },
];

const SEED_BLOGS = [
  {
    title: 'New Additions To Our Great Metro Trucks.',
    description: 'Discover the latest high-performance truck parts we\'ve added to our catalog. From heavy-duty suspension kits to upgraded exhaust systems, we\'ve got everything your metro truck needs.',
    author: 'Admin',
    status: 'Published' as const,
    publishedAt: new Date('2025-03-12'),
    seoTitle: 'New Metro Truck Parts - Engine & Suspension Upgrades',
    seoDescription: 'Explore our latest additions for metro trucks including suspension kits and exhaust systems.',
  },
  {
    title: 'Express Delivery Is Going To Slow Down In 2025.',
    description: 'Supply chain shifts are affecting delivery timelines across the auto parts industry. Here\'s what you need to know and how we\'re adapting to keep your orders on time.',
    author: 'Admin',
    status: 'Published' as const,
    publishedAt: new Date('2025-03-12'),
    seoTitle: 'Auto Parts Delivery Changes in 2025',
    seoDescription: 'Learn how supply chain changes affect auto parts delivery and what we\'re doing about it.',
  },
  {
    title: 'Top 5 Brake Upgrades for High-Performance Vehicles.',
    description: 'Upgrading your braking system is one of the most impactful modifications you can make. We break down the top five brake upgrades that deliver real stopping power.',
    author: 'Admin',
    status: 'Published' as const,
    publishedAt: new Date('2025-02-28'),
    seoTitle: 'Top 5 Brake Upgrades for Performance Cars',
    seoDescription: 'Find the best brake upgrades for high-performance vehicles with our expert guide.',
  },
];

const SEED_SERVICES = [
  {
    title: 'Engine Diagnostics',
    description: 'Comprehensive engine diagnostic service using the latest OBD-II tools to identify issues and recommend repairs.',
    price: 500000,
    duration: '1 hour',
    category: 'Engine Parts',
    status: 'Published' as const,
  },
  {
    title: 'Brake Inspection & Replacement',
    description: 'Full brake system inspection including pads, rotors, and calipers. Replacement service available on-site.',
    price: 800000,
    duration: '2 hours',
    category: 'Braking Systems',
    status: 'Published' as const,
  },
  {
    title: 'Suspension Tune-Up',
    description: 'Professional suspension inspection and adjustment for optimal ride comfort and vehicle handling.',
    price: 600000,
    duration: '1.5 hours',
    category: 'Suspension',
    status: 'Published' as const,
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(CategoryProduct.name) private categoryModel: Model<CategoryProductDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(BlogVersion.name) private blogVersionModel: Model<BlogVersion>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(TenantMembership.name) private membershipModel: Model<TenantMembershipDocument>,
    @InjectModel(TestimonialSection.name)
    private testimonialSectionModel: Model<TestimonialSectionDocument>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    await this.seedRoles();
    await this.repairUserRoles();

    const tenant = await this.tenantModel.findOne().sort({ createdAt: 1 }).exec();
    if (!tenant) {
      this.logger.warn('No tenant found — skipping demo seed.');
      return;
    }

    const tenantId = (tenant._id as Types.ObjectId).toString();
    this.logger.log(`Seeding demo data for tenant: ${tenant.name} (${tenantId})`);

    await this.repairUserTenants(tenant._id as Types.ObjectId);
    await this.seedTenantMemberships();
    const categoryMap = await this.seedCategories(tenantId);
    await this.seedProducts(tenantId, categoryMap);
    await this.seedBlogs(tenantId);
    await this.seedServices(tenantId);
    await this.seedTestimonialSections(tenantId);

    this.logger.log('Demo seed complete.');
  }

  private async seedRoles() {
    for (const name of SEED_ROLES) {
      const exists = await this.roleModel.findOne({ name }).exec();
      if (!exists) {
        await this.roleModel.create({ name });
        this.logger.log(`  + Role: ${name}`);
      }
    }
  }

  private async repairUserRoles() {
    const adminRole = await this.roleModel.findOne({ name: 'admin' }).exec();
    if (!adminRole) return;

    const result = await this.userModel.updateMany(
      { role: { $exists: false } },
      { $set: { role: adminRole._id } },
    );
    // Also catch docs where role is null
    const result2 = await this.userModel.updateMany(
      { role: null },
      { $set: { role: adminRole._id } },
    );

    const fixed = result.modifiedCount + result2.modifiedCount;
    if (fixed > 0) {
      this.logger.log(`  ~ Repaired role for ${fixed} user(s) → admin`);
    }
  }

  private async repairUserTenants(defaultTenantId: Types.ObjectId) {
    const result = await this.userModel.updateMany(
      { $or: [{ tenantId: { $exists: false } }, { tenantId: null }] },
      { $set: { tenantId: defaultTenantId } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`  ~ Repaired tenantId for ${result.modifiedCount} user(s) → ${defaultTenantId}`);
    }
  }

  private async seedTenantMemberships() {
    const users = await this.userModel.find({ tenantId: { $ne: null } }).select('_id tenantId').lean().exec();
    if (users.length === 0) return;

    let created = 0;
    for (const u of users) {
      const uid = (u as any)._id?.toString();
      const tid = (u as any).tenantId?.toString();
      if (!Types.ObjectId.isValid(uid) || !Types.ObjectId.isValid(tid)) continue;

      const res = await this.membershipModel
        .updateOne(
          { userId: new Types.ObjectId(uid), tenantId: new Types.ObjectId(tid) },
          {
            $setOnInsert: {
              userId: new Types.ObjectId(uid),
              tenantId: new Types.ObjectId(tid),
              roleInTenant: 'member',
              status: 'active',
            },
          },
          { upsert: true },
        )
        .exec();

      if (res.upsertedCount && res.upsertedCount > 0) created += res.upsertedCount;
    }

    if (created > 0) {
      this.logger.log(`  + TenantMembership: created ${created} membership(s) from users.tenantId`);
    }
  }

  private async seedCategories(tenantId: string): Promise<Map<string, string>> {
    const map = new Map<string, string>();

    for (const cat of SEED_CATEGORIES) {
      const existing = await this.categoryModel.findOne({ tenantId, name: cat.name }).exec();
      if (existing) {
        map.set(cat.name, (existing._id as Types.ObjectId).toString());
        continue;
      }
      const created = await this.categoryModel.create({ ...cat, tenantId });
      map.set(cat.name, (created._id as Types.ObjectId).toString());
      this.logger.log(`  + Category: ${cat.name}`);
    }

    return map;
  }

  private async seedProducts(tenantId: string, categoryMap: Map<string, string>) {
    for (const p of SEED_PRODUCTS) {
      const exists = await this.productModel.findOne({ tenantId, name: p.name }).exec();
      if (exists) continue;

      const categoryId = categoryMap.get(p.categoryName);
      if (!categoryId) continue;

      const { categoryName, ...rest } = p;
      await this.productModel.create({
        ...rest,
        tenantId,
        category: new Types.ObjectId(categoryId),
        isOutOfStock: rest.stock === 0,
        stockThreshold: 5,
      });
      this.logger.log(`  + Product: ${p.name}`);
    }
  }

  private async seedBlogs(tenantId: string) {
    for (const b of SEED_BLOGS) {
      const exists = await this.blogModel.findOne({ tenantId, title: b.title }).exec();
      if (exists) continue;

      const blog = await this.blogModel.create({ ...b, tenantId });
      const count = await this.blogVersionModel.countDocuments({ blogId: blog._id });
      await this.blogVersionModel.create({
        blogId: blog._id,
        title: blog.title,
        description: blog.description,
        status: blog.status,
        author: blog.author,
        versionNumber: count + 1,
      });
      this.logger.log(`  + Blog: ${b.title}`);
    }
  }

  private async seedServices(tenantId: string) {
    for (const s of SEED_SERVICES) {
      const exists = await this.serviceModel.findOne({ tenantId, title: s.title }).exec();
      if (exists) continue;

      await this.serviceModel.create({ ...s, tenantId });
      this.logger.log(`  + Service: ${s.title}`);
    }
  }

  private async seedTestimonialSections(tenantId: string) {
    const exists = await this.testimonialSectionModel
      .findOne({ tenantId, slug: SEED_TESTIMONIAL_SECTION_SLUG })
      .exec();
    if (exists) return;

    await this.testimonialSectionModel.create({
      ...SEED_TESTIMONIAL_SECTION,
      tenantId: new Types.ObjectId(tenantId),
    });
    this.logger.log(`  + TestimonialSection: ${SEED_TESTIMONIAL_SECTION.title} (${SEED_TESTIMONIAL_SECTION_SLUG})`);
  }
}
