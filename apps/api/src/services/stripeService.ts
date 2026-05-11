import Stripe from "stripe";
import { env } from "../config/env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.stripeSecretKey) return null;
  stripe ??= new Stripe(env.stripeSecretKey);
  return stripe;
}
