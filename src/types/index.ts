export interface PriceSchema {
  base: number;
  sale: number;
  member: number;
}

export interface Variant {
  size: string;
  stock: number;
}

export interface ProductDetails {
  material: string;
  gsm: string;
  wash_care: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  fit_type: string;
  fandom_tag: string;
  badges: string[];
  prices: PriceSchema;
  images: string[];
  variants: Variant[];
  details: ProductDetails;
}

export interface CartItem {
  productId: string;
  title: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

export interface FilterState {
  sizes: string[];
  fits: string[];
  themes: string[];
  priceRange: [number, number];
}

export interface User {
  phone: string;
  name?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthdate?: string;
  city?: string;
  password?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  phone: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}
