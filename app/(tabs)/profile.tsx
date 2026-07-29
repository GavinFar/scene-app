import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, spacing, typography } from '@/constants/tokens';
import { useSignOut } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';

// Placeholder — slices 4–5 replace this with the full profile view + edit.
// Sign-out lives here from day one so auth is fully round-trippable.
export default function ProfileTab() {
  const signOut = useSignOut();
  const session = useAuthStore((state) => state.session);

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // The session clears via the auth listener; the tabs guard redirects.
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <EmptyState
        title="Your profile is coming together"
        message="Your card, reel, roles, and reviews will live here."
      />
      <View style={styles.footer}>
        {signOut.isError && (
          <Text style={styles.errorText}>
            Couldn't sign out — check your connection and try again.
          </Text>
        )}
        {session?.user.email != null && (
          <Text style={styles.email}>Signed in as {session.user.email}</Text>
        )}
        <Button
          label="Sign out"
          variant="secondary"
          onPress={handleSignOut}
          loading={signOut.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  footer: {
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  email: {
    ...typography.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    ...typography.sm,
    color: colors.error,
    textAlign: 'center',
  },
});
