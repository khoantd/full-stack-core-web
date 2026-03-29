export interface Automaker {
  _id: string;
  name: string;
  country: string;
  logo?: string;
  supportedModelYears: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomakerRequest {
  name: string;
  country: string;
  logo?: string;
  supportedModelYears?: number[];
}

export interface UpdateAutomakerRequest {
  name?: string;
  country?: string;
  logo?: string;
  supportedModelYears?: number[];
}

export interface AutomakersResponse {
  data: Automaker[];
  pagination: {
    total: number;
    page: number | string;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AutomakerQueryParams {
  page?: number | string;
  limit?: number;
  search?: string;
}
