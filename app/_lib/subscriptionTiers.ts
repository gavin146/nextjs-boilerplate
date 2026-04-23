/**
 * Subscription model sketch for an iOS app with tiered IAP.
 *
 * Implementation notes (Apple / StoreKit):
 * - Prefer mapping SKUs -> entitlements (what the app gates on), not “tier names”.
 * - Free trials are typically configured as introductory offers on the subscription product
 *   in App Store Connect (and surfaced via StoreKit / RevenueCat).
 * - Apple guidance: App Store Review Guidelines (payments/subscriptions):
 *   https://developer.apple.com/app-store/review/guidelines/
 *
 * Recommended platform for most teams shipping iOS subscriptions:
 * - RevenueCat: https://www.revenuecat.com/
 */

export type EntitlementId =
  | "programs_access"
  | "workout_tracking_basic"
  | "standard_video_library"
  | "ai_coaching_realtime"
  | "form_feedback_mode"
  | "program_auto_progression"
  | "advanced_analytics"
  | "readiness_engine"
  | "premium_media_pack";

export type TierId = "low" | "medium" | "high";

export const TIERS: Record<
  TierId,
  {
    marketingName: string;
    /** Monthly price in USD (for UI copy + internal planning). StoreKit SKUs still live in App Store Connect. */
    priceUsdPerMonth: number;
    entitlements: EntitlementId[];
  }
> = {
  low: {
    marketingName: "Low",
    priceUsdPerMonth: 20,
    entitlements: [
      "programs_access",
      "workout_tracking_basic",
      "standard_video_library",
    ],
  },
  medium: {
    marketingName: "Medium",
    priceUsdPerMonth: 40,
    entitlements: [
      "programs_access",
      "workout_tracking_basic",
      "standard_video_library",
      "ai_coaching_realtime",
      "form_feedback_mode",
      "program_auto_progression",
    ],
  },
  high: {
    marketingName: "High",
    priceUsdPerMonth: 80,
    entitlements: [
      "programs_access",
      "workout_tracking_basic",
      "standard_video_library",
      "ai_coaching_realtime",
      "form_feedback_mode",
      "program_auto_progression",
      "advanced_analytics",
      "readiness_engine",
      "premium_media_pack",
    ],
  },
};

export function tierIncludesEntitlement(
  tier: TierId,
  entitlement: EntitlementId,
) {
  return TIERS[tier].entitlements.includes(entitlement);
}
