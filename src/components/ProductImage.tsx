import Image from "next/image";
import { BikeArt } from "./BikeArt";
import type { ProductType } from "@/types";

// Показує реальне фото, якщо воно є; інакше — згенерований SVG.
// imageUrl — фото обраного кольору або головне фото товару.
export function ProductImage({
  imageUrl,
  hue = 24,
  type = "bike",
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  imageUrl?: string | null;
  hue?: number;
  type?: ProductType;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain"
        />
      </div>
    );
  }
  return <BikeArt hue={hue} type={type} className={className} />;
}
