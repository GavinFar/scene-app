import { Redirect, Tabs } from 'expo-router';

import { SceneTabBar } from '@/components/SceneTabBar';
import { colors } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth';

export default function TabsLayout() {
  const session = useAuthStore((state) => state.session);

  // Auth guard: no session, no tabs. Also fires the moment a sign-out lands,
  // bouncing the user back to the welcome screen.
  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      tabBar={(props) => <SceneTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Titles stay — SceneTabBar reads them for accessibility labels. */}
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
