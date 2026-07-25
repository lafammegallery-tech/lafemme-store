import { cookies } from "next/headers";
import { getSession } from "@/backend/auth/session";
import { cartRepository } from "@/backend/database/repositories/cart.repository";
import { getPrisma } from "@/backend/database/prisma";
import { getStorefrontProduct } from "./storefront-product.service";

const CART_COOKIE = "lafemme_cart";

type CartIdentity =
  | { kind: "user"; userId: string }
  | { kind: "guest"; sessionId: string };

export async function getCartIdentity(): Promise<CartIdentity> {
  const session = await getSession();

  if (session) {
    return { kind: "user", userId: session.userId };
  }

  const store = await cookies();
  return {
    kind: "guest",
    sessionId: store.get(CART_COOKIE)?.value ?? "",
  };
}

export async function getCurrentCart() {
  const identity = await getCartIdentity();

  if (identity.kind === "user") {
    return cartRepository.findByUserId(identity.userId);
  }

  if (!identity.sessionId) return null;

  return cartRepository.findBySessionId(identity.sessionId);
}

export async function addProductToCart(productId: string, quantity = 1) {
  const identity = await getCartIdentity();
  let cart =
    identity.kind === "user"
      ? await cartRepository.findByUserId(identity.userId)
      : identity.sessionId
        ? await cartRepository.findBySessionId(identity.sessionId)
        : null;

  if (!cart) {
    cart = await cartRepository.create(
      identity.kind === "user"
        ? { userId: identity.userId }
        : { sessionId: identity.sessionId }
    );
  }

  const product = await getStorefrontProduct(productId);
  if (!product) throw new Error("Product not found");

  return cartRepository.addItem(
    cart.id,
    productId,
    Number(product.price),
    quantity
  );
}

export function cartToView(cart: any) {
  if (!cart?.items) return [];

  return cart.items.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    name: item.product?.name ?? "",
    image:
      item.product?.images?.[0]?.url ??
      item.product?.image ??
      "",
    price: Number(item.unitPrice),
    quantity: item.quantity,
  }));
}
