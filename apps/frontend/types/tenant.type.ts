export const ALL_FEATURES = [
  'categories',
  'products',
  'automakers',
  'events',
  'services',
  'blogs',
  'payments',
] as const;

export type FeatureKey = typeof ALL_FEATURES[number];

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  status: string;
  plan?: string;
  enabledFeatures: FeatureKey[];
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
