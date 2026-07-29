import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';

import { RatingInput } from '@/components/RatingInput';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { useProfile } from '@/hooks/useProfile';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { useAuthStore } from '@/store/auth';
import type { Enums } from '@/types/database';

const MAX_BODY_LENGTH = 2000;

interface ReviewForm {
  kind: Enums<'review_kind'>;
  rating: number | null;
  body: string;
  employerPhone: string;
}

const KIND_OPTIONS: { value: Enums<'review_kind'>; label: string; description: string }[] = [
  {
    value: 'review',
    label: 'Review',
    description: 'Rate what it was like to work with them.',
  },
  {
    value: 'recommendation',
    label: 'Recommendation',
    description: 'Vouch for them as an employer or collaborator — no rating.',
  },
];

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUserId = useAuthStore((state) => state.session?.user.id);
  const profile = useProfile(id);
  const submitReview = useSubmitReview(id ?? '');

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<ReviewForm>({
    defaultValues: {
      kind: 'review',
      rating: null,
      body: '',
      employerPhone: '',
    },
  });
  const kind = watch('kind');

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onSubmit = handleSubmit(async (form) => {
    try {
      await submitReview.mutateAsync({
        kind: form.kind,
        rating: form.rating,
        body: form.body,
        employerPhone: form.employerPhone,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Error message renders from submitReview.error below.
    }
  });

  let body: React.ReactNode;
  if (profile.isPending) {
    body = (
      <View style={styles.skeletonWrap}>
        <Skeleton style={styles.skeletonHeading} />
        <Skeleton style={styles.skeletonLine} />
        <Skeleton style={styles.skeletonBlock} />
      </View>
    );
  } else if (profile.isError) {
    body = (
      <ErrorState
        title="Couldn't load this profile"
        message="We couldn't reach the network. Check your connection and try again."
        onRetry={() => profile.refetch()}
      />
    );
  } else if (!profile.data) {
    body = (
      <EmptyState
        title="This profile isn't on Scene"
        message="It may have been removed. Head back and keep browsing the scene."
      >
        <Button label="Go back" variant="secondary" onPress={goBack} />
      </EmptyState>
    );
  } else if (profile.data.id === currentUserId) {
    body = (
      <EmptyState
        title="That's you"
        message="You can't review yourself — your work does that. Share your profile and let the reviews come in."
      >
        <Button label="Go back" variant="secondary" onPress={goBack} />
      </EmptyState>
    );
  } else {
    const subject = profile.data;
    body = (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Review {subject.display_name}</Text>
        <Text style={styles.subtext}>
          Worked with them? Say how it went — reviews build the scene's trust.
        </Text>

        <Controller
          control={control}
          name="kind"
          render={({ field: { value, onChange } }) => (
            <View style={styles.kindGroup}>
              <View style={styles.kindRow}>
                {KIND_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={value === option.value}
                    onPress={() => {
                      onChange(option.value);
                      clearErrors('rating');
                    }}
                  />
                ))}
              </View>
              <Text style={styles.kindDescription}>
                {KIND_OPTIONS.find((option) => option.value === value)?.description}
              </Text>
            </View>
          )}
        />

        {kind === 'review' && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Rating</Text>
            <Controller
              control={control}
              name="rating"
              rules={{
                validate: (value, form) =>
                  form.kind !== 'review' || value != null || 'Tap a star rating.',
              }}
              render={({ field: { value, onChange } }) => (
                <RatingInput value={value} onChange={onChange} error={errors.rating?.message} />
              )}
            />
          </View>
        )}

        <Controller
          control={control}
          name="body"
          rules={{
            required: 'A few words are the whole point.',
            maxLength: {
              value: MAX_BODY_LENGTH,
              message: `Keep it under ${MAX_BODY_LENGTH} characters.`,
            },
            validate: (value) => value.trim().length > 0 || 'A few words are the whole point.',
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={kind === 'review' ? 'Your review' : 'Your recommendation'}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.body?.message}
              placeholder="What did they work on with you, and how did it go?"
              multiline
              textAlignVertical="top"
              style={styles.bodyInput}
            />
          )}
        />

        <Controller
          control={control}
          name="employerPhone"
          rules={{
            validate: (value) => {
              const digits = value.replace(/\D/g, '');
              return digits.length === 0 || digits.length >= 7 || 'That number looks too short.';
            },
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.field}>
              <Input
                label="Employer phone (optional)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.employerPhone?.message}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="(512) 555-0100"
              />
              <Text style={styles.privacyNote}>
                Backs this up as an employer connection. The number is hashed on your device —
                it's never stored or shown.
              </Text>
            </View>
          )}
        />

        {submitReview.isError && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {submitReview.error.message || 'Something went wrong — try again.'}
            </Text>
          </View>
        )}

        <Button
          label={kind === 'review' ? 'Submit review' : 'Submit recommendation'}
          onPress={onSubmit}
          loading={submitReview.isPending}
          style={styles.submit}
        />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={goBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
        >
          <ArrowLeft color={colors.text} size={22} />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 44, // accessibility floor (spec #14)
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backPressed: {
    opacity: 0.7,
  },
  scroll: {
    padding: spacing['2xl'],
    paddingTop: spacing.md,
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
  kindGroup: {
    gap: spacing.sm,
  },
  kindRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  kindDescription: {
    ...typography.sm,
    color: colors.textMuted,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.sm,
    color: colors.textMuted,
  },
  bodyInput: {
    minHeight: 140,
    paddingTop: spacing.md,
  },
  privacyNote: {
    ...typography.xs,
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
  submit: {
    marginTop: spacing.sm,
  },
  skeletonWrap: {
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  skeletonHeading: {
    width: '60%',
    height: 28,
  },
  skeletonLine: {
    width: '85%',
    height: 14,
  },
  skeletonBlock: {
    width: '100%',
    height: 140,
  },
});
