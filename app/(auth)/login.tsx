import { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { useSignIn } from '@/hooks/useAuth';
import type { SignInInput } from '@/hooks/useAuth';

export default function Login() {
  const signIn = useSignIn();
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (form) => {
    try {
      await signIn.mutateAsync(form);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Session lands via the auth listener; the (auth) layout redirects.
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subtext}>Your scene missed you.</Text>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required.',
              pattern: { value: /.+@.+\..+/, message: 'That email doesn’t look right.' },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholder="you@example.com"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password is required.' }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                ref={passwordRef}
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                placeholder="Your password"
              />
            )}
          />

          {signIn.isError && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                {signIn.error.message === 'Invalid login credentials'
                  ? "Email and password don't match — try again."
                  : signIn.error.message || 'Something went wrong — try again.'}
              </Text>
            </View>
          )}

          <Button label="Log in" onPress={onSubmit} loading={signIn.isPending} />
          <Button
            label="New here? Create an account"
            variant="ghost"
            onPress={() => router.replace('/(auth)/signup')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing['2xl'],
    gap: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  heading: {
    ...typography.xl,
    color: colors.text,
  },
  subtext: {
    ...typography.base,
    color: colors.textMuted,
  },
  banner: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.error,
  },
  bannerText: {
    ...typography.sm,
    color: colors.error,
  },
});
