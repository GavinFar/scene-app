import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';

import { ResultRow } from '@/components/search/ResultRow';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RATE_TIERS } from '@/constants/rateTiers';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { useCities } from '@/hooks/useCities';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useRolesCatalog } from '@/hooks/useRolesCatalog';
import { useSearchProfiles } from '@/hooks/useSearchProfiles';
import { useFiltersStore } from '@/store/filters';

const QUERY_DEBOUNCE_MS = 300;
const EXPERIENCE_STEPS = [1, 2, 3, 4, 5];
const SKELETON_ROWS = [0, 1, 2, 3];

export default function SearchTab() {
  const filters = useFiltersStore();
  const currentProfile = useCurrentProfile();
  const catalog = useRolesCatalog();
  const cities = useCities();
  const results = useSearchProfiles();

  // Local input state debounced into the store so the query (and its
  // TanStack key) doesn't churn per keystroke.
  const [text, setText] = useState(filters.query);
  useEffect(() => {
    const timer = setTimeout(() => filters.setQuery(text), QUERY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const isClient = currentProfile.data?.user_mode === 'client';
  const placeholder = isClient
    ? 'I need someone to film and edit a video…'
    : 'Search by name or role…';

  // Role chips narrow to the selected departments once any are picked.
  const visibleRoles = (catalog.data ?? [])
    .filter(
      (department) =>
        filters.departments.length === 0 || filters.departments.includes(department.slug)
    )
    .flatMap((department) => department.roles);

  const activeCities = (cities.data ?? []).filter((city) => city.is_active);

  const hasActiveFilters =
    filters.roles.length > 0 ||
    filters.departments.length > 0 ||
    filters.cityId != null ||
    filters.minExperience != null ||
    filters.rateTiers.length > 0;

  const clearSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setText('');
    filters.setQuery('');
  };

  const openProfile = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${id}`);
  };

  const filterHeader = (
    <View style={styles.filters}>
      <ChipRow>
        {(catalog.data ?? []).map((department) => (
          <Chip
            key={department.slug}
            label={department.name}
            selected={filters.departments.includes(department.slug)}
            onPress={() => filters.toggleDepartment(department.slug)}
          />
        ))}
      </ChipRow>
      <ChipRow>
        {visibleRoles.map((role) => (
          <Chip
            key={role.slug}
            label={role.name}
            selected={filters.roles.includes(role.slug)}
            onPress={() => filters.toggleRole(role.slug)}
          />
        ))}
      </ChipRow>
      <ChipRow>
        {RATE_TIERS.map((tier) => (
          <Chip
            key={tier}
            label={tier}
            selected={filters.rateTiers.includes(tier)}
            onPress={() => filters.toggleRateTier(tier)}
          />
        ))}
        {EXPERIENCE_STEPS.map((step) => (
          <Chip
            key={step}
            label={`${step}●+`}
            selected={filters.minExperience === step}
            onPress={() =>
              filters.setMinExperience(filters.minExperience === step ? null : step)
            }
          />
        ))}
      </ChipRow>
      {activeCities.length > 1 ? (
        <ChipRow>
          {activeCities.map((city) => (
            <Chip
              key={city.id}
              label={city.name}
              selected={filters.cityId === city.id}
              onPress={() => filters.setCityId(filters.cityId === city.id ? null : city.id)}
            />
          ))}
        </ChipRow>
      ) : null}
      {hasActiveFilters ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset all filters"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            filters.resetFilters();
            setText('');
          }}
          style={({ pressed }) => [styles.reset, pressed && styles.resetPressed]}
        >
          <Text style={styles.resetLabel}>Reset filters</Text>
        </Pressable>
      ) : null}
    </View>
  );

  let body: React.ReactNode;
  if (results.isPending) {
    body = (
      <ScrollView contentContainerStyle={styles.listContent}>
        {filterHeader}
        {SKELETON_ROWS.map((index) => (
          <Skeleton key={index} style={styles.skeletonRow} />
        ))}
      </ScrollView>
    );
  } else if (results.isError) {
    body = (
      <ErrorState
        title="Search couldn't run"
        message="We couldn't reach the network. Check your connection and try again."
        onRetry={() => results.refetch()}
      />
    );
  } else {
    body = (
      <FlatList
        data={results.data}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ResultRow profile={item} onPress={() => openProfile(item.id)} />
        )}
        ListHeaderComponent={filterHeader}
        contentContainerStyle={[
          styles.listContent,
          results.data.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <EmptyState
            title="No matches in the scene"
            message={
              isClient
                ? 'Try describing the job another way — "film a video", "edit", "make it look cinematic".'
                : 'Loosen a filter or try another role — new creatives join the scene all the time.'
            }
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Find your crew.</Text>
        <View style={styles.searchBar}>
          <Search color={colors.textMuted} size={18} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardAppearance="dark"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search the scene"
            style={styles.searchInput}
          />
          {text.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={clearSearch}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.resetPressed}
            >
              <X color={colors.textMuted} size={18} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {body}
    </SafeAreaView>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography['2xl'],
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  searchInput: {
    ...typography.base,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  filters: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  reset: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  resetPressed: {
    opacity: 0.7,
  },
  resetLabel: {
    ...typography.sm,
    color: colors.accent,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  skeletonRow: {
    height: 76,
    borderRadius: radius.lg,
  },
});
