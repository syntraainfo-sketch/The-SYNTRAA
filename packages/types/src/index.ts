/** Shared commerce + API typings for THE SYNTRAA */

export type UserRole = "customer" | "admin" | "superAdmin";

export interface GalleryImage {
  publicId: string;
  alt: string;
  focal?: string;
}

export interface ProductVariant {
  sku: string;
  label?: string;
  size?: string;
  color?: string;
  priceUSD: number;
  compareAtUSD?: number;
  inventory: number;
}

export interface ProductSeo {
  title?: string;
  description?: string;
  ogImagePublicId?: string;
  canonicalPath?: string;
}

export interface ProductDTO {
  _id?: string;
  /** API may expose camelCase id */
  id?: string;
  title: string;
  slug: string;
  descriptionShort?: string;
  richDescription?: string;
  ingredients?: string;
  howToUse?: string;
  benefits?: string;
  sustainability?: string;
  /** Short bullet lines for PDP (e.g. key points above the fold). */
  highlights?: string[];
  gallery: GalleryImage[];
  variants: ProductVariant[];
  categories: string[];
  featured?: boolean;
  seo?: ProductSeo;
  aggregateRating?: number;
  reviewsCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface CategoryDTO {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  order?: number;
  heroImagePublicId?: string;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "cancelled"
  | "refunded";

export type PaymentProvider =
  | "stripe"
  | "jazzcash"
  | "easypaisa"
  | "bank_transfer"
  | "cod";

export interface BankAccountDetails {
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
  branch?: string;
  instructions?: string;
}

export interface CheckoutPaymentOptions {
  bankTransfer: boolean;
  easypaisa: boolean;
  cod: boolean;
  bankAccount?: BankAccountDetails;
  easypaisaWallet?: string;
}

export interface OrderLine {
  sku: string;
  title: string;
  quantity: number;
  unitPriceUSD: number;
  imagePublicId?: string;
}

export interface OrderDTO {
  _id?: string;
  orderNumber: string;
  customerEmail?: string;
  items: OrderLine[];
  subtotalUSD: number;
  status: OrderStatus;
  currency: string;
  payment?: {
    provider: PaymentProvider;
    intentId?: string;
    txnRef?: string;
    status: string;
    paidAt?: string;
  };
  createdAt?: string;
}

export interface CartItemDTO {
  productId: string;
  sku: string;
  quantity: number;
}
