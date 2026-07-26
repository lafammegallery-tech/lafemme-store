import { MetalType, Prisma, ProductStatus } from "@/generated/prisma/client";
import { getPrisma } from "../prisma";

/** نوع شامل محصول همراه با روابط برای نمایش در فروشگاه. */
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: { orderBy: { sortOrder: "asc" } };
    variants: {
      where: { isActive: true; deletedAt: null };
      include: { inventory: true };
    };
    inventory: true;
  };
}>;

/** گزینه‌های فیلتر محصول. */
export interface ProductFilterOptions {
  metalType?: MetalType;
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  search?: string;
  isFeatured?: boolean;
  sortBy?: "newest" | "price-low" | "price-high" | "weight-low" | "weight-high";
}

/** تبدیل گزینه‌های فیلتر به شرط Prisma. */
function buildWhereClause(options: ProductFilterOptions): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    deletedAt: null,
  };

  if (options.metalType) {
    where.metalType = options.metalType;
  }

  if (options.isFeatured !== undefined) {
    where.isFeatured = options.isFeatured;
  }

  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    // قیمت در Prisma از نوع Decimal است — باید به رشته تبدیل شود
    where.price = {};
    if (options.minPrice !== undefined) where.price.gte = String(options.minPrice);
    if (options.maxPrice !== undefined) where.price.lte = String(options.maxPrice);
  }

  if (options.minWeight !== undefined || options.maxWeight !== undefined) {
    where.weightValue = {};
    if (options.minWeight !== undefined) where.weightValue.gte = options.minWeight;
    if (options.maxWeight !== undefined) where.weightValue.lte = options.maxWeight;
  }

  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
      { shortDescription: { contains: options.search, mode: "insensitive" } },
    ];
  }

  return where;
}

/** تبدیل گزینه‌های مرتب‌سازی به orderBy های Prisma. */
function buildOrderBy(sortBy?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sortBy) {
    case "price-low":
      return [{ price: "asc" }];
    case "price-high":
      return [{ price: "desc" }];
    case "weight-low":
      return [{ weightValue: "asc" }];
    case "weight-high":
      return [{ weightValue: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

/** شامل کردن روابط مورد نیاز برای نمایش محصول. */
const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: {
    where: { isActive: true, deletedAt: null },
    include: { inventory: true },
  },
  inventory: true,
} satisfies Prisma.ProductInclude;

export const productRepository = {
  /** یافتن تمام محصولات فعال با فیلتر و مرتب‌سازی. */
  async findAll(options: ProductFilterOptions = {}): Promise<ProductWithRelations[]> {
    return getPrisma().product.findMany({
      where: buildWhereClause(options),
      include: productInclude,
      orderBy: buildOrderBy(options.sortBy),
    });
  },

  /** یافتن محصولات فعال بدون فیلتر (ساده‌تر). */
  findAllActive() {
    return getPrisma().product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  /** یافتن محصولات منتخب. */
  findFeatured(limit = 6) {
    return getPrisma().product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        deletedAt: null,
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /** یافتن محصولات بر اساس نوع فلز. */
  findByMetalType(metalType: MetalType, limit?: number) {
    return getPrisma().product.findMany({
      where: {
        metalType,
        status: ProductStatus.ACTIVE,
        deletedAt: null,
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit } : {}),
    });
  },

  /** یافتن محصول بر اساس slug. */
  findBySlug(slug: string) {
    return getPrisma().product.findFirst({
      where: { slug, deletedAt: null },
      include: productInclude,
    });
  },

  /** یافتن محصول بر اساس id. */
  findById(id: string) {
    return getPrisma().product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
  },

  /** جست‌وجوی محصولات. */
  search(query: string, limit = 20) {
    return getPrisma().product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
        ],
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /** یافتن محصولات مرتبط. */
  findRelated(productId: string, metalType: MetalType, limit = 4) {
    return getPrisma().product.findMany({
      where: {
        id: { not: productId },
        metalType,
        status: ProductStatus.ACTIVE,
        deletedAt: null,
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /** شمارش کل محصولات فعال. */
  countActive() {
    return getPrisma().product.count({
      where: { status: ProductStatus.ACTIVE, deletedAt: null },
    });
  },
};
