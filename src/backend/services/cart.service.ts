import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { getSession } from "@/backend/auth/session";
import { cartRepository } from "@/backend/database/repositories/cart.repository";
import { getPrisma } from "@/backend/database/prisma";
import { getStorefrontProduct } from "./storefront-product.service";

const CART_COOKIE = "lafemme_cart";
type CartIdentity = { kind: "user"; userId: string } | { kind: "guest"; sessionId: string };
export async function getCartIdentity(): Promise<CartIdentity> {
  const session = await getSession(); if (session) return { kind: "user", userId: session.userId };
  const store = await cookies(); let sessionId = store.get(CART_COOKIE)?.value;
  if (!sessionId) { sessionId = randomUUID(); store.set(CART_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60*60*24*30 }); }
  return { kind: "guest", sessionId };
}
export async function getCurrentCart() { const identity = await getCartIdentity(); return identity.kind === "user" ? cartRepository.findByUserId(identity.userId) : cartRepository.findBySessionId(identity.sessionId); }
export async function ensureCurrentCart() { const identity = await getCartIdentity(); const existing = identity.kind === "user" ? await cartRepository.findByUserId(identity.userId) : await cartRepository.findBySessionId(identity.sessionId); return existing ?? cartRepository.create(identity.kind === "user" ? { userId: identity.userId } : { sessionId: identity.sessionId }); }
export async function addProductToCart(productId: string, quantity = 1) {
  const product = await getStorefrontProduct(productId); if (!product || product.stock < 1) throw new Error("محصول موجود نیست.");
  const cart = await ensureCurrentCart();
  const existing = await getPrisma().cartItem.findFirst({ where: { cartId: cart.id, productId, variantId: null } });
  if (existing) return getPrisma().cartItem.update({ where: { id: existing.id }, data: { quantity: Math.min(existing.quantity + quantity, product.stock), unitPrice: product.price } });
  return getPrisma().cartItem.create({ data: { cartId: cart.id, productId, quantity: Math.min(quantity, product.stock), unitPrice: product.price } });
}
export function cartToView(cart: Awaited<ReturnType<typeof getCurrentCart>>) { return (cart?.items ?? []).map(item => ({ id: item.id, productId: item.productId, title: item.product.name, image: item.product.images[0]?.url || item.product.image || "/assets/images/placeholder.svg", price: Number(item.unitPrice), quantity: item.quantity, variant: item.variant?.title })); }
