import { Product } from "../models/Product";

export async function enrichCart(cart: {
  toJSON: () => { items?: Array<{ productId: unknown; sku: string; quantity: number }> };
}) {
  const json = cart.toJSON();
  const items = json.items ?? [];
  const productIds = [...new Set(items.map((item) => String(item.productId)))];
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));

  return {
    ...json,
    items: items.map((item) => {
      const product = byId.get(String(item.productId));
      const variant = product?.variants?.find((v: { sku: string }) => v.sku === item.sku);
      return {
        ...item,
        productId: String(item.productId),
        title: product?.title,
        slug: product?.slug,
        imagePublicId: product?.gallery?.[0]?.publicId,
        variantLabel: variant?.size ?? variant?.label,
        priceUSD: variant?.priceUSD,
      };
    }),
  };
}
