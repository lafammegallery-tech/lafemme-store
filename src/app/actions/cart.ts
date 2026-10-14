"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addProductToCart } from "@/backend/services/cart.service";
import { cartRepository } from "@/backend/database/repositories/cart.repository";
import { getCurrentCart } from "@/backend/services/cart.service";
import { positiveInt } from "@/backend/security/validation";
export async function addToCartAction(formData: FormData) { const productId = String(formData.get("productId") ?? ""); if (productId) await addProductToCart(productId); revalidatePath("/cart"); redirect("/cart"); }
export async function updateCartItemAction(formData: FormData) {
  const cart = await getCurrentCart();
  const id = String(formData.get("itemId") ?? "");
  const item = cart?.items.find((entry) => entry.id === id);
  if (!cart || !item) throw new Error("آیتم سبد خرید پیدا نشد.");
  const quantity = positiveInt(formData.get("quantity"), 99);
  if (quantity > 0) {
    const { getStorefrontProduct } = await import("@/backend/services/storefront-product.service");
    const product = await getStorefrontProduct(item.productId);
    if (!product || quantity > product.stock) throw new Error("موجودی محصول کافی نیست.");
  }
  await cartRepository.updateQuantity(id, quantity, cart.id);
  revalidatePath("/cart");
}
export async function removeCartItemAction(formData: FormData) {
  const cart = await getCurrentCart();
  if (!cart) return;
  await cartRepository.removeItem(String(formData.get("itemId") ?? ""), cart.id);
  revalidatePath("/cart");
}
