export const ALL_FEATURES = [
  'categories',
  'products',
  'automakers',
  'events',
  'services',
  'serviceCategories',
  'blogs',
  'payments',
  'pricings',
  'landingPages',
] as const;

export type FeatureKey = typeof ALL_FEATURES[number];

export interface LandingConfig {
  siteName?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  theme?: string;
  heroEnabled?: boolean;
  categoriesEnabled?: boolean;
  statsEnabled?: boolean;
  aboutEnabled?: boolean;
  productsEnabled?: boolean;
  testimonialsEnabled?: boolean;
  blogsEnabled?: boolean;
  contactEnabled?: boolean;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  status: string;
  plan?: string;
  enabledFeatures: FeatureKey[];
  landingConfig: LandingConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  plan?: string;
  enabledFeatures?: FeatureKey[];
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  logo?: string;
  domain?: string;
  plan?: string;
  enabledFeatures?: FeatureKey[];
}
