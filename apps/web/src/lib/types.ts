import type { ProductDTO } from "@syntraa/types";

export type ListedProduct = ProductDTO & { id?: string };

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  error?: { message?: string };
}
