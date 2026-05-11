export type DbRole = "customer" | "admin" | "superAdmin";

export type DbProduct = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price_usd: number;
  compare_at_usd: number | null;
  inventory: number;
  featured: boolean;
  ingredients: string[] | null;
  created_at: string;
  updated_at: string;
};

export type DbProductImage = {
  id: string;
  product_id: string;
  public_url: string;
  alt: string | null;
  sort_order: number;
};

export type DbProfile = {
  id: string; // matches auth.users.id
  email: string | null;
  full_name: string | null;
  role: DbRole;
  created_at: string;
};

export type DbCartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
};

export type DbWishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type DbOrder = {
  id: string;
  user_id: string | null;
  email: string | null;
  status: "draft" | "pending_payment" | "paid" | "fulfilled" | "cancelled";
  subtotal_usd: number;
  created_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  title: string;
  unit_price_usd: number;
  quantity: number;
};

