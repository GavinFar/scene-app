/**
 * Public day-rate display tiers. Exact figures stay private until two users
 * connect (locked product decision #2).
 */
export const RATE_TIERS = ['$', '$$', '$$$'] as const;

export type RateTier = (typeof RATE_TIERS)[number];
