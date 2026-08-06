/**
 * Editorial photography used for merchandising.
 *
 * These are the same Unsplash slugs the seeder records in
 * `server/src/data/catalog.js` under EDITORIAL. They are not products, so they
 * never come back from the API, so the storefront holds them directly.
 */
const UNSPLASH = "https://images.unsplash.com";

export function editorialUrl(photo: string, width = 1600, aspect?: string) {
  const ar = aspect ? `&ar=${aspect}` : "";
  return `${UNSPLASH}/${photo}?w=${width}&q=80&auto=format&fit=crop${ar}`;
}

export const EDITORIAL = {
  /** Knitwear, denim and a watch laid out flat. The season opener. */
  hero: "photo-1556905055-8f358a7a47b2",
  /** Boots, belt and sunglasses. Used for the outerwear collection block. */
  layering: "photo-1479064555552-3ef4979f8908",
  /** Chambray on a hanger. Used for the workwear collection block. */
  workshop: "photo-1596755094514-f87e34085b2c",
  /** Stacked stoneware. Used for the table collection block. */
  table: "photo-1610701596007-11502861dcfa",
} as const;
