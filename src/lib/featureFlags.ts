export const FEATURE_FLAGS = {
  GRADIENT_CARD_BACKGROUND: true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  const value = FEATURE_FLAGS[flag];
  return value === true;
}


