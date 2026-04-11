export const PRICING_CURRENCIES = ["VND", "USD"] as const;
export type PricingCurrency = typeof PRICING_CURRENCIES[number];

export type PricingStatus = "Draft" | "Published" | "Archived";

export interface PricingTier {
  name: string;
  currency: PricingCurrency;
  /**
   * Minor units:
   * - USD: cents
   * - VND: dong
   */
  unitAmount: number;
  description?: string;
  features?: string[];
  order: number;
}

export interface PricingFaqItem {
  q: string;
  a: string;
}

/** Localized fields stored per locale (API merges via ?locale=). */
export type PricingTranslatableFields = {
  title: string;
  tiers: PricingTier[];
  faqEyebrow?: string;
  faqTitle?: string;
  faqs?: PricingFaqItem[];
  homeFaqEyebrow?: string;
  homeFaqTitle?: string;
  homeFaqs?: PricingFaqItem[];
};

export interface Pricing {
  _id: string;
  title: string;
  slug?: string;
  status: PricingStatus;
  tiers: PricingTier[];
  faqEyebrow?: string;
  faqTitle?: string;
  faqs?: PricingFaqItem[];
  homeFaqEyebrow?: string;
  homeFaqTitle?: string;
  homeFaqs?: PricingFaqItem[];
  translations?: Partial<Record<string, Partial<PricingTranslatableFields>>>;
  createdAt: string;
  updatedAt: string;
}

export interface PricingsResponse {
  data: Pricing[];
  pagination: {
    total: number;
    page: number | "all";
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PricingQueryParams {
  page?: number | "all";
  limit?: number;
  search?: string;
  status?: PricingStatus;
}

export type CreatePricingRequest = Pick<
  Pricing,
  "title" | "slug" | "status" | "tiers"
> & {
  faqEyebrow?: string;
  faqTitle?: string;
  faqs?: PricingFaqItem[];
  homeFaqEyebrow?: string;
  homeFaqTitle?: string;
  homeFaqs?: PricingFaqItem[];
  translations?: Pricing["translations"];
};
export type UpdatePricingRequest = Partial<CreatePricingRequest>;

