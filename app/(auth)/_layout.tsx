import { Redirect, Stack } from 'expo-router';

import { colors } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout() {
  const session = useAuthStore((state) => state.session);

  // Signed-in users never see auth screens — this also handles the moment
  // right after login/signup, when the session lands and this re-renders.
  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
