"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { positiveInt, text } from "@/backend/security/validation";
import { writeAudit } from "@/backend/services/audit.service";
import type { DiscountType, MetalType, OrderStatus, UserRole } from "@/generated/prisma/enums";

export async function updateOrderStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const prisma = getPrisma();
  const id = text(formData.get("id"), 100);
  const status = text(formData.get("status"), 30) as OrderStatus;
  const note = text(formData.get("note"), 500);

  const old = await prisma.order.findUniqueOrThrow({ where: { id } });
  await prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: { create: { fromStatus: old.status, toStatus: status, note, actorId: session.userId } },
    },
  });

  if (status === "CANCELLED") {
    for (const item of await prisma.orderItem.findMany({ where: { orderId: id } })) {
      if (item.productId) {
        await prisma.inventory.updateMany({
          where: { productId: item.productId },
          data: { reserved: { decrement: item.quantity } },
        });
      }
    }
  }

  await writeAudit({
    actorId: session.userId,
    action: "ORDER_STATUS_UPDATE",
    entityType: "Order",
    entityId: id,
    oldData: { status: old.status },
    newData: { status, note },
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function updateInventoryAction(formData: FormData) {
  const s = await requireAdmin();
  const productId = text(formData.get("productId"), 100);
  const quantity = positiveInt(formData.get("quantity"));
  const lowStockAt = positiveInt(formData.get("lowStockAt"), 1000);
  const p = getPrisma();
  const old = await p.inventory.findFirst({ where: { productId } });
  await p.inventory.upsert({
    where: { productId },
    create: { productId, quantity, lowStockAt },
    update: { quantity, lowStockAt },
  });
  await p.product.update({ where: { id: productId }, data: { stock: quantity } });
  await writeAudit({
    actorId: s.userId,
    action: "INVENTORY_UPDATE",
    entityType: "Product",
    entityId: productId,
    oldData: old ? { quantity: old.quantity } : undefined,
    newData: { quantity, lowStockAt },
  });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}

export async function toggleProductAction(formData: FormData) {
  const s = await requireAdmin();
  const id = text(formData.get("id"), 100);
  const p = getPrisma();
  const old = await p.product.findUniqueOrThrow({ where: { id } });
  const status = old.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  await p.product.update({ where: { id }, data: { status } });
  await writeAudit({
    actorId: s.userId,
    action: "PRODUCT_STATUS_TOGGLE",
    entityType: "Product",
    entityId: id,
    oldData: { status: old.status },
    newData: { status },
  });
  revalidatePath("/admin/products");
}

export async function createProductAction(formData: FormData) {
  const s = await requireAdmin();
  const p = getPrisma();
  const name = text(formData.get("name"), 160);
  const slug = text(formData.get("slug"), 180).toLowerCase().replace(/\s+/g, "-");
  const categoryId = text(formData.get("categoryId"), 100);
  if (!name || !slug || !categoryId) throw new Error("نام، اسلاگ و دسته‌بندی الزامی است.");

  const price = String(Math.max(0, Number(formData.get("price") || 0)));
  const stock = positiveInt(formData.get("stock"), 1_000_000);
  const premiumPercent = String(Math.max(0, Number(formData.get("premiumPercent") || 0)));
  const fixedPremium = String(Math.max(0, Number(formData.get("fixedPremium") || 0)));
  const isFeatured = formData.get("isFeatured") === "on";

  const product = await p.product.create({
    data: {
      name,
      slug,
      categoryId,
      sku: text(formData.get("sku"), 80) || null,
      metalType: text(formData.get("metalType"), 20) as MetalType,
      weight: text(formData.get("weight"), 50) || null,
      weightValue: Number(formData.get("weightValue") || 0) || null,
      purity: text(formData.get("purity"), 50) || null,
      price,
      premiumPercent,
      fixedPremium,
      isFeatured,
      stock,
      status: "ACTIVE",
      shortDescription: text(formData.get("shortDescription"), 300) || null,
      inventory: { create: { quantity: stock, lowStockAt: 5 } },
    },
  });

  await writeAudit({
    actorId: s.userId,
    action: "PRODUCT_CREATE",
    entityType: "Product",
    entityId: product.id,
    newData: { name, slug, stock },
  });
  revalidatePath("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  const s = await requireAdmin();
  const p = getPrisma();
  const id = text(formData.get("id"), 100);
  const old = await p.product.findUniqueOrThrow({ where: { id } });
  const name = text(formData.get("name"), 160);
  const price = String(Math.max(0, Number(formData.get("price") || 0)));
  const stock = positiveInt(formData.get("stock"), 1_000_000);
  const premiumPercent = String(Math.max(0, Number(formData.get("premiumPercent") || 0)));
  const fixedPremium = String(Math.max(0, Number(formData.get("fixedPremium") || 0)));
  const isFeatured = formData.get("isFeatured") === "on";
  const categoryId = text(formData.get("categoryId"), 100) || undefined;

  await p.$transaction([
    p.product.update({
      where: { id },
      data: {
        name,
        price,
        stock,
        ...(categoryId ? { categoryId } : {}),
        sku: text(formData.get("sku"), 80) || null,
        metalType: text(formData.get("metalType"), 20) as MetalType,
        weight: text(formData.get("weight"), 50) || null,
        weightValue: Number(formData.get("weightValue") || 0) || null,
        purity: text(formData.get("purity"), 50) || null,
        premiumPercent,
        fixedPremium,
        isFeatured,
        shortDescription: text(formData.get("shortDescription"), 300) || null,
      },
    }),
    p.inventory.upsert({
      where: { productId: id },
      create: { productId: id, quantity: stock, lowStockAt: 5 },
      update: { quantity: stock },
    }),
  ]);

  await writeAudit({
    actorId: s.userId,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: id,
    oldData: { name: old.name, price: String(old.price) },
    newData: { name, price: String(price), stock },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/admin/products/${id}/edit`);
}

export async function archiveProductAction(formData: FormData) {
  const s = await requireAdmin();
  const id = text(formData.get("id"), 100);
  await getPrisma().product.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: new Date() } });
  await writeAudit({ actorId: s.userId, action: "PRODUCT_ARCHIVE", entityType: "Product", entityId: id });
  revalidatePath("/admin/products");
}

export async function createCategoryAction(formData: FormData) {
  const s = await requireAdmin();
  const name = text(formData.get("name"), 100);
  const slug = text(formData.get("slug"), 120).toLowerCase().replace(/\s+/g, "-");
  const x = await getPrisma().category.create({
    data: { name, slug, description: text(formData.get("description"), 300) || null },
  });
  await writeAudit({
    actorId: s.userId,
    action: "CATEGORY_CREATE",
    entityType: "Category",
    entityId: x.id,
    newData: { name, slug },
  });
  revalidatePath("/admin/categories");
}

export async function toggleCategoryAction(formData: FormData) {
  const s = await requireAdmin();
  const id = text(formData.get("id"), 100);
  const p = getPrisma();
  const old = await p.category.findUniqueOrThrow({ where: { id } });
  await p.category.update({ where: { id }, data: { isActive: !old.isActive } });
  await writeAudit({
    actorId: s.userId,
    action: "CATEGORY_TOGGLE",
    entityType: "Category",
    entityId: id,
    newData: { isActive: !old.isActive },
  });
  revalidatePath("/admin/categories");
}

/** ارتقا یا تنزل نقش کاربر بین مشتری و مدیر — یک ادمین نمی‌تواند نقش خودش را تغییر دهد. */
export async function toggleUserAdminAction(formData: FormData) {
  const s = await requireAdmin();
  const id = text(formData.get("id"), 100);
  if (id === s.userId) throw new Error("امکان تغییر نقش حساب خودتان وجود ندارد.");

  const p = getPrisma();
  const target = await p.user.findUniqueOrThrow({ where: { id } });
  const nextRole: UserRole = target.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
  await p.user.update({ where: { id }, data: { role: nextRole } });

  await writeAudit({
    actorId: s.userId,
    action: "USER_ROLE_TOGGLE",
    entityType: "User",
    entityId: id,
    oldData: { role: target.role },
    newData: { role: nextRole },
  });
  revalidatePath("/admin/users");
}

export async function createCouponAction(formData: FormData) {
  const s = await requireAdmin();
  const p = getPrisma();
  const code = text(formData.get("code"), 40).toUpperCase();
  const c = await p.coupon.create({
    data: {
      code,
      title: text(formData.get("title"), 120),
      type: text(formData.get("type"), 30) as DiscountType,
      value: String(Math.max(0, Number(formData.get("value") || 0))),
      minimumAmount: String(Math.max(0, Number(formData.get("minimumAmount") || 0))),
      usageLimit: Number(formData.get("usageLimit") || 0) || null,
      expiresAt: formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : null,
    },
  });
  await writeAudit({ actorId: s.userId, action: "COUPON_CREATE", entityType: "Coupon", entityId: c.id, newData: { code } });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(formData: FormData) {
  const s = await requireAdmin();
  const id = text(formData.get("id"), 100);
  const p = getPrisma();
  const old = await p.coupon.findUniqueOrThrow({ where: { id } });
  await p.coupon.update({ where: { id }, data: { isActive: !old.isActive } });
  await writeAudit({
    actorId: s.userId,
    action: "COUPON_TOGGLE",
    entityType: "Coupon",
    entityId: id,
    newData: { isActive: !old.isActive },
  });
  revalidatePath("/admin/coupons");
}

export async function updateMarketOverrideAction(formData: FormData) {
  const s = await requireAdmin();
  const isManual = formData.get("isManualMode") === "on";
  const gold750Raw = formData.get("manualGold750");
  const silver999Raw = formData.get("manualSilver999");
  const gold750 = gold750Raw ? String(Math.max(0, Number(gold750Raw))) : null;
  const silver999 = silver999Raw ? String(Math.max(0, Number(silver999Raw))) : null;

  const prisma = getPrisma() as unknown as {
    marketSettings?: { upsert: (args: unknown) => Promise<unknown> };
  };
  if (!prisma.marketSettings?.upsert) throw new Error("لطفاً مهاجرت دیتابیس را اجرا کنید.");

  await prisma.marketSettings.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      isManualMode: isManual,
      manualGold750: gold750 ?? undefined,
      manualSilver999: silver999 ?? undefined,
      updatedBy: s.userId,
    },
    update: {
      isManualMode: isManual,
      manualGold750: gold750 ?? undefined,
      manualSilver999: silver999 ?? undefined,
      updatedBy: s.userId,
    },
  });

  await writeAudit({
    actorId: s.userId,
    action: "MARKET_OVERRIDE_UPDATE",
    entityType: "MarketSettings",
    entityId: "global",
    newData: { isManual, gold750, silver999 },
  });
  revalidatePath("/admin/market-prices");
}
