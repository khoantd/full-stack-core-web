export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  status: string;
  plan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  logo?: string;
  domain?: string;
  plan?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  logo?: string;
  domain?: string;
  plan?: string;
}
