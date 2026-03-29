export interface LandingCategory {
  _id: string;
  name: string;
  icon: string;
  description: string;
}

export interface LandingProduct {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  thumbnailUrl?: string;
  categoryName?: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
}

export const FEATURED_CATEGORIES: LandingCategory[] = [
  { _id: "1", name: "Engine Parts", icon: "⚙️", description: "High-performance engine components for all makes and models." },
  { _id: "2", name: "Braking Systems", icon: "🛑", description: "Reliable brake pads, rotors, and calipers for safe stopping." },
  { _id: "3", name: "Suspension", icon: "🔧", description: "Shocks, struts, and springs for a smooth ride." },
  { _id: "4", name: "Electrical", icon: "⚡", description: "Batteries, alternators, and wiring harnesses." },
  { _id: "5", name: "Exhaust Systems", icon: "💨", description: "Performance exhausts and catalytic converters." },
  { _id: "6", name: "Accessories", icon: "🚗", description: "Interior and exterior accessories for every vehicle." },
];

export const FEATURED_PRODUCTS: LandingProduct[] = [
  { _id: "1", name: "Car Wheel With Rotor", price: 25, salePrice: 18, categoryName: "Braking Systems" },
  { _id: "2", name: "Child Car Seat", price: 50, categoryName: "Accessories" },
  { _id: "3", name: "Car Seat", price: 45, categoryName: "Accessories" },
  { _id: "4", name: "Tire Pressure Gauge", price: 40, salePrice: 35, categoryName: "Accessories" },
  { _id: "5", name: "Disc Brake", price: 250, salePrice: 200, categoryName: "Braking Systems" },
  { _id: "6", name: "BMW Boosted Engine", price: 150, salePrice: 117, categoryName: "Engine Parts" },
];

export const STATS = [
  { value: "15+", label: "Years Experience" },
  { value: "50K+", label: "Parts in Stock" },
  { value: "120+", label: "Trusted Brands" },
  { value: "98%", label: "Customer Satisfaction" },
];

export interface BlogPost {
  _id: string;
  title: string;
  description: string;
  image?: string;
  author: string;
  date: string;
  category: string;
  comments: number;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    _id: "1",
    title: "New Additions To Our Great Metro Trucks.",
    description:
      "Discover the latest high-performance truck parts we've added to our catalog. From heavy-duty suspension kits to upgraded exhaust systems, we've got everything your metro truck needs.",
    author: "Admin",
    date: "March 12, 2025",
    category: "Engine Parts",
    comments: 6,
  },
  {
    _id: "2",
    title: "Express Delivery Is Going To Slow Down In 2025.",
    description:
      "Supply chain shifts are affecting delivery timelines across the auto parts industry. Here's what you need to know and how we're adapting to keep your orders on time.",
    author: "Admin",
    date: "March 12, 2025",
    category: "Logistics",
    comments: 6,
  },
  {
    _id: "3",
    title: "Top 5 Brake Upgrades for High-Performance Vehicles.",
    description:
      "Upgrading your braking system is one of the most impactful modifications you can make. We break down the top five brake upgrades that deliver real stopping power.",
    author: "Admin",
    date: "February 28, 2025",
    category: "Braking Systems",
    comments: 4,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    _id: "1",
    name: "James Carter",
    role: "Fleet Manager",
    content: "Outstanding quality and fast delivery. Our fleet has never run smoother since switching to Car Parts.",
  },
  {
    _id: "2",
    name: "Maria Lopez",
    role: "Auto Mechanic",
    content: "The best supplier I've worked with. Genuine parts, competitive prices, and excellent customer support.",
  },
  {
    _id: "3",
    name: "David Kim",
    role: "Car Enthusiast",
    content: "Huge selection and everything arrives well-packaged. I won't shop anywhere else for my builds.",
  },
];
