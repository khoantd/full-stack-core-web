export type LandingPageStatus = 'Draft' | 'Published' | 'Archived';

export type LandingSection =
  | {
      id: string;
      type: 'hero';
      headline: string;
      subheadline?: string;
      image?: string;
      primaryCtaLabel?: string;
      primaryCtaHref?: string;
      secondaryCtaLabel?: string;
      secondaryCtaHref?: string;
    }
  | {
      id: string;
      type: 'features';
      heading: string;
      items: { title: string; description?: string; icon?: string }[];
    }
  | {
      id: string;
      type: 'cta';
      title: string;
      body?: string;
      buttonLabel: string;
      buttonHref: string;
    }
  | {
      id: string;
      type: 'stats';
      items: { label: string; value: string }[];
    }
  | {
      id: string;
      type: 'faq';
      items: { question: string; answer: string }[];
    }
  | {
      id: string;
      type: 'paragraph';
      body: string;
    }
  | {
      id: string;
      type: 'footer';
      heading?: string;
      columns: {
        heading?: string;
        links: { label: string; href: string }[];
      }[];
      bottomText?: string;
    };

export interface LandingPage {
  _id: string;
  slug: string;
  title: string;
  status: LandingPageStatus;
  isDefault: boolean;
  seoTitle?: string;
  seoDescription?: string;
  sections: LandingSection[];
  createdAt: string;
  updatedAt: string;
}

export interface LandingPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LandingPagesResponse {
  data: LandingPage[];
  pagination: LandingPagination;
}

export interface LandingPagesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LandingPageStatus;
}

export interface CreateLandingPageRequest {
  slug: string;
  title: string;
  status?: LandingPageStatus;
  isDefault?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  sections?: LandingSection[];
}

export interface UpdateLandingPageRequest {
  slug?: string;
  title?: string;
  status?: LandingPageStatus;
  isDefault?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  sections?: LandingSection[];
}

export interface DeleteLandingPageResponse {
  deleted: boolean;
}
