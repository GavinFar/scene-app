import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/tokens';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <Text style={styles.wordmark}>Scene</Text>
        <Text style={styles.tagline}>Find your scene.</Text>
        <Text style={styles.pitch}>
          The local network for film creatives. Advertise your work, get
          discovered, and hire crew whose work speaks for itself.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Create account" onPress={() => router.push('/(auth)/signup')} />
        <Button
          label="Log in"
          variant="secondary"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing['2xl'],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    ...typography['2xl'],
    color: colors.text,
  },
  tagline: {
    ...typography.md,
    color: colors.accent,
  },
  pitch: {
    ...typography.base,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
});
