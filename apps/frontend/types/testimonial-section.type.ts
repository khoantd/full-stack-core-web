export type TestimonialSectionStatus = "Draft" | "Published" | "Archived";

export interface TestimonialItem {
  text: string;
  name: string;
  role: string;
  order: number;
}

export type TestimonialSectionTranslatableFields = {
  eyebrow: string;
  title: string;
  items: TestimonialItem[];
};

export interface TestimonialSection {
  _id: string;
  eyebrow: string;
  title: string;
  slug?: string;
  status: TestimonialSectionStatus;
  items: TestimonialItem[];
  translations?: Partial<Record<string, Partial<TestimonialSectionTranslatableFields>>>;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialSectionsResponse {
  data: TestimonialSection[];
  pagination: {
    total: number;
    page: number | "all";
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TestimonialSectionQueryParams {
  page?: number | "all";
  limit?: number;
  search?: string;
  status?: TestimonialSectionStatus;
}

export type CreateTestimonialSectionRequest = Pick<
  TestimonialSection,
  "eyebrow" | "title" | "slug" | "status" | "items"
>;
export type UpdateTestimonialSectionRequest = Partial<CreateTestimonialSectionRequest>;
