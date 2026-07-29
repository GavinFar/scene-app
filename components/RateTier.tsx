import { StyleSheet, Text } from 'react-native';

import { RATE_TIERS } from '@/constants/rateTiers';
import type { RateTier as RateTierValue } from '@/constants/rateTiers';
import { colors, typography } from '@/constants/tokens';

const MAX_DOLLARS = RATE_TIERS[RATE_TIERS.length - 1].length;

interface RateTierProps {
  tier: RateTierValue;
}

/**
 * $ / $$ / $$$ day-rate tier — active dollars bright, the rest ghosted.
 * Exact figures stay private (locked decision #2).
 */
export function RateTier({ tier }: RateTierProps) {
  const remainder = '$'.repeat(MAX_DOLLARS - tier.length);

  return (
    <Text
      accessible
      accessibilityLabel={`Rate tier ${tier.length} of ${MAX_DOLLARS}`}
      style={styles.active}
    >
      {tier}
      {remainder ? <Text style={styles.ghost}>{remainder}</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  active: {
    ...typography.mono,
    color: colors.text,
  },
  ghost: {
    color: colors.textMuted,
  },
});
