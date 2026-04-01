const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface LandingCategory {
  _id: string;
  name: string;
  description?: string;
}

export interface LandingProduct {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  category?: { _id: string; name: string } | null;
}

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

export interface LandingData {
  products: LandingProduct[];
  categories: LandingCategory[];
  config: LandingConfig;
}

export async function getLandingData(): Promise<LandingData> {
  try {
    const res = await fetch(`${API_URL}/landing`, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      return { products: [], categories: [], config: {} };
    }

    return res.json();
  } catch {
    return { products: [], categories: [], config: {} };
  }
}
