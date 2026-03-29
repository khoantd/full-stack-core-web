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

export interface LandingData {
  products: LandingProduct[];
  categories: LandingCategory[];
}

export async function getLandingData(): Promise<LandingData> {
  const res = await fetch(`${API_URL}/landing`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  });

  if (!res.ok) {
    // Fallback to empty arrays on error — components handle empty state
    return { products: [], categories: [] };
  }

  return res.json();
}
