import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { USER_MODES } from '@/constants/userModes';
import { useSignUp } from '@/hooks/useAuth';
import { useCities } from '@/hooks/useCities';
import type { SignUpInput } from '@/hooks/useAuth';

type SignUpForm = Omit<SignUpInput, 'mode' | 'cityId'> & {
  mode: SignUpInput['mode'] | null;
  cityId: string | null;
};

export default function SignUp() {
  const signUp = useSignUp();
  const cities = useCities();
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      mode: null,
      cityId: null,
    },
  });

  const onSubmit = handleSubmit(async (form) => {
    // mode/cityId are validated required below — non-null by the time we're here.
    if (form.mode == null || form.cityId == null) return;
    try {
      const result = await signUp.mutateAsync({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        mode: form.mode,
        cityId: form.cityId,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.needsEmailConfirmation) {
        setEmailSentTo(form.email.trim());
      }
      // Otherwise the session lands via the auth listener and the (auth)
      // layout redirects to the tabs — nothing to do here.
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Error message renders from signUp.error below.
    }
  });

  if (emailSentTo != null) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.confirmWrap}>
          <Text style={styles.heading}>Check your inbox</Text>
          <Text style={styles.subtext}>
            We sent a confirmation link to {emailSentTo}. Tap it, then come
            back and log in — your scene will be waiting.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.heading}>Join Scene</Text>
          <Text style={styles.subtext}>Set up how you'll use it — takes a minute.</Text>

          <Controller
            control={control}
            name="displayName"
            rules={{
              required: 'Your name is what shows on your card.',
              minLength: { value: 2, message: 'At least 2 characters.' },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.displayName?.message}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                placeholder="John Gaffer"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required.',
              pattern: { value: /.+@.+\..+/, message: 'That email doesn’t look right.' },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                ref={emailRef}
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
            rules={{
              required: 'Password is required.',
              minLength: { value: 6, message: 'At least 6 characters.' },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                ref={passwordRef}
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                placeholder="At least 6 characters"
              />
            )}
          />

          <Text style={styles.sectionLabel}>How will you use Scene?</Text>
          <Controller
            control={control}
            name="mode"
            rules={{ required: 'Pick the mode that fits.' }}
            render={({ field: { value, onChange } }) => (
              <View style={styles.optionGroup}>
                {USER_MODES.map((mode) => {
                  const selected = value === mode.value;
                  return (
                    <Pressable
                      key={mode.value}
                      accessibilityRole="radio"
                      accessibilityLabel={mode.label}
                      accessibilityState={{ selected }}
                      onPress={() => {
                        Haptics.selectionAsync();
                        onChange(mode.value);
                      }}
                      style={({ pressed }) => [
                        styles.optionCard,
                        selected && styles.optionCardSelected,
                        pressed && styles.optionCardPressed,
                      ]}
                    >
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {mode.label}
                      </Text>
                      <Text style={styles.optionDescription}>{mode.description}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
          {errors.mode != null && <Text style={styles.fieldError}>{errors.mode.message}</Text>}

          <Text style={styles.sectionLabel}>What's your scene?</Text>
          <Controller
            control={control}
            name="cityId"
            rules={{ required: 'Pick your city.' }}
            render={({ field: { value, onChange } }) => (
              <View style={styles.optionGroup}>
                {cities.isPending &&
                  [0, 1, 2].map((i) => <View key={i} style={styles.citySkeleton} />)}

                {cities.isError && (
                  <View style={styles.inlineError}>
                    <Text style={styles.inlineErrorText}>
                      Couldn't load cities — check your connection.
                    </Text>
                    <Button
                      label="Retry"
                      variant="secondary"
                      onPress={() => cities.refetch()}
                    />
                  </View>
                )}

                {cities.data != null && cities.data.length === 0 && (
                  <Text style={styles.optionDescription}>
                    No cities live yet — Austin opens first. Hang tight.
                  </Text>
                )}

                {cities.data?.map((city) => {
                  const selected = value === city.id;
                  return (
                    <Pressable
                      key={city.id}
                      accessibilityRole="radio"
                      accessibilityLabel={`${city.name}, ${city.state}`}
                      accessibilityState={{ selected, disabled: !city.is_active }}
                      disabled={!city.is_active}
                      onPress={() => {
                        Haptics.selectionAsync();
                        onChange(city.id);
                      }}
                      style={({ pressed }) => [
                        styles.cityRow,
                        selected && styles.optionCardSelected,
                        pressed && styles.optionCardPressed,
                        !city.is_active && styles.cityRowDisabled,
                      ]}
                    >
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {city.name}, {city.state}
                      </Text>
                      {!city.is_active && <Text style={styles.comingSoon}>coming soon</Text>}
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
          {errors.cityId != null && (
            <Text style={styles.fieldError}>{errors.cityId.message}</Text>
          )}

          {signUp.isError && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                {signUp.error.message || 'Something went wrong — try again.'}
              </Text>
            </View>
          )}

          <Button
            label="Create account"
            onPress={onSubmit}
            loading={signUp.isPending}
            style={styles.submit}
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
  },
  heading: {
    ...typography.xl,
    color: colors.text,
  },
  subtext: {
    ...typography.base,
    color: colors.textMuted,
  },
  sectionLabel: {
    ...typography.md,
    color: colors.text,
    marginTop: spacing.sm,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionCard: {
    minHeight: 44,
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  optionCardPressed: {
    opacity: 0.75,
  },
  optionLabel: {
    ...typography.md,
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.accent,
  },
  optionDescription: {
    ...typography.sm,
    color: colors.textMuted,
  },
  cityRow: {
    minHeight: 44,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cityRowDisabled: {
    opacity: 0.5,
  },
  citySkeleton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
  },
  comingSoon: {
    ...typography.mono,
    color: colors.textMuted,
  },
  inlineError: {
    gap: spacing.md,
  },
  inlineErrorText: {
    ...typography.sm,
    color: colors.error,
  },
  fieldError: {
    ...typography.xs,
    color: colors.error,
    marginTop: -spacing.md,
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
  submit: {
    marginTop: spacing.sm,
  },
  confirmWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
});
