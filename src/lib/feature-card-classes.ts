/**
 * Per-variant spacing and title type for FeatureCard (design-system.md section 7.7),
 * measured from the Home and About snapshots. Written out in full so Tailwind can
 * scan every class.
 */

export type FeatureCardVariant = "service" | "product" | "solution" | "industry" | "differentiator";

interface FeatureCardClasses {
  readonly container: string;
  readonly title: string;
}

const FEATURE_CARD_CLASSES: Record<FeatureCardVariant, FeatureCardClasses> = {
  /* Home "Four services": number, title 20/snug (17 on Mobile), gap 20. */
  service: { container: "gap-5 p-6 xl:p-8", title: "text-17/snug xl:text-20/snug" },
  /* Home products: icon tile, title 20/snug (17 on Mobile), gap 20. */
  product: { container: "gap-5 p-6 xl:p-8", title: "text-17/snug xl:text-20/snug" },
  /* Home solutions: title 19/snug (17 on Mobile), gap 12. */
  solution: { container: "gap-3 p-6 xl:p-8", title: "text-17/snug xl:text-19/snug" },
  /* Home industries: title 22/heading (18 on Mobile), gap 16. */
  industry: { container: "gap-4 p-6 xl:p-8", title: "text-18/heading xl:text-22/heading" },
  /* About differentiators: icon tile, title 22/heading (18 on Mobile), gap 20. */
  differentiator: {
    container: "gap-5 p-6 xl:p-8",
    title: "text-18/heading xl:text-22/heading",
  },
};

export function featureCardClasses(variant: FeatureCardVariant): FeatureCardClasses {
  return FEATURE_CARD_CLASSES[variant];
}
