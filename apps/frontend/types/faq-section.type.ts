export type FaqSectionStatus = "Draft" | "Published" | "Archived";

export interface FaqItem {
  question: string;
  answer: string;
  order: number;
}

export type FaqSectionTranslatableFields = {
  eyebrow: string;
  title: string;
  items: FaqItem[];
};

export interface FaqSection {
  _id: string;
  eyebrow: string;
  title: string;
  slug?: string;
  status: FaqSectionStatus;
  items: FaqItem[];
  translations?: Partial<Record<string, Partial<FaqSectionTranslatableFields>>>;
  createdAt: string;
  updatedAt: string;
}

export interface FaqSectionsResponse {
  data: FaqSection[];
  pagination: {
    total: number;
    page: number | "all";
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FaqSectionQueryParams {
  page?: number | "all";
  limit?: number;
  search?: string;
  status?: FaqSectionStatus;
}

export type CreateFaqSectionRequest = Pick<FaqSection, "eyebrow" | "title" | "slug" | "status" | "items">;
export type UpdateFaqSectionRequest = Partial<CreateFaqSectionRequest>;
