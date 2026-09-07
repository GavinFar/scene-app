import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Home, MessageCircle, Search, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, radius, spacing } from '@/constants/tokens';

/**
 * Derived from the navigator itself rather than deep-imported: expo-router 57
 * vendors react-navigation internally and ships no exports map, so any path
 * into `expo-router/build/...` is liable to move between SDKs.
 */
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICON_SIZE = 22;

/** Route name → glyph. A route missing from this map renders no icon. */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  search: Search,
  messages: MessageCircle,
  profile: User,
};

/**
 * Scene's tab bar — a floating dock rather than the stock bar.
 *
 * Labels are dropped deliberately: four destinations with unambiguous glyphs
 * don't need them, and the words were the loudest generic-Expo tell in the
 * whole app. The active tab is marked by accent colour plus a short underline.
 */
export function SceneTabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.dock}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const Icon = ICONS[route.name];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (isFocused || event.defaultPrevented) return;

            Haptics.selectionAsync();
            navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
              onPress={onPress}
              onLongPress={() => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              }}
              style={styles.tab}
            >
              {Icon ? (
                <Icon
                  color={isFocused ? colors.accent : colors.textMuted}
                  size={ICON_SIZE}
                  strokeWidth={isFocused ? 2.2 : 1.8}
                />
              ) : null}
              <View style={[styles.indicator, isFocused && styles.indicatorActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  indicator: {
    width: 14,
    height: 2,
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: colors.accent,
  },
});
