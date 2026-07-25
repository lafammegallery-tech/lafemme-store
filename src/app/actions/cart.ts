"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addProductToCart } from "@/backend/services/cart.service";
import { cartRepository } from "@/backend/database/repositories/cart.repository";
export async function addToCartAction(formData: FormData) { const productId = String(formData.get("productId") ?? ""); if (productId) await addProductToCart(productId); revalidatePath("/cart"); redirect("/cart"); }
export async function updateCartItemAction(formData: FormData) { const id = String(formData.get("itemId") ?? ""); const quantity = Math.max(0, Math.min(99, Number(formData.get("quantity") ?? 1))); if (id) await cartRepository.updateQuantity(id, quantity); revalidatePath("/cart"); }
export async function removeCartItemAction(formData: FormData) { const id = String(formData.get("itemId") ?? ""); if (id) await cartRepository.removeItem(id); revalidatePath("/cart"); }
