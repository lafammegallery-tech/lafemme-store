"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const [selected, setSelected] = useState(0);

  if (sorted.length === 0) return null;

  const current = sorted[selected];

  return (
    <div className="product-gallery">
      {/* تصویر اصلی */}
      <div
        className="product-image"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          maxHeight: "480px",
          borderRadius: "var(--radius-large)",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <Image
          src={current.url}
          alt={current.altText ?? productName}
          fill
          style={{ objectFit: "contain" }}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* تصاویر کوچک */}
      {sorted.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelected(idx)}
              style={{
                width: "72px",
                height: "72px",
                position: "relative",
                borderRadius: "var(--radius-small)",
                overflow: "hidden",
                border: idx === selected ? "2px solid var(--color-gold)" : "2px solid var(--color-border)",
                background: "var(--color-surface-raised)",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
              aria-label={`تصویر ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? productName}
                fill
                style={{ objectFit: "cover" }}
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
