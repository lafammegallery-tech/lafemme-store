import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { PriceDisplay } from "./PriceDisplay";
export interface ProductCardProps {
  href: string;
  name: string;
  imageSrc: string;
  imageAlt?: string;
  price?: number;
  badge?: string;
  meta?: ReactNode;
  action?: ReactNode;
  priority?: boolean;
}
/** Reusable commerce card that keeps product data and business logic outside the UI layer. */
export function ProductCard({
  href,
  name,
  imageSrc,
  imageAlt = name,
  price,
  badge,
  meta,
  action,
  priority,
}: ProductCardProps) {
  return (
    <Card className="group overflow-hidden transition duration-lf hover:-translate-y-1 hover:border-lf-gold/40 hover:shadow-lf-gold">
      <Link href={href} className="block focus-visible:outline-none focus-visible:shadow-lf-focus">
        <div className="relative aspect-square overflow-hidden bg-lf-black">
          {badge && <Badge className="absolute right-3 top-3 z-10">{badge}</Badge>}
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-lf group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-lf-white">{name}</h3>
          {meta && <div className="mt-2 text-sm text-lf-gray">{meta}</div>}
          {typeof price === "number" && (
            <div className="mt-4">
              <PriceDisplay value={price} />
            </div>
          )}
        </div>
      </Link>
      {action && <div className="border-t border-lf-border p-4">{action}</div>}
    </Card>
  );
}
