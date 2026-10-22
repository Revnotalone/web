export type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number; discount_price: number | null; stock: number;
  category_id: string | null; images: string[] | null; sizes: string[] | null; colors: string[] | null;
  is_featured: boolean; categories?: { name: string; slug: string } | null;
};
export type Category = { id: string; name: string; slug: string };
export type CartItem = {
  key: string; id: string; slug: string; name: string; price: number;
  image: string | null; size: string; color: string; qty: number; max: number;
};
