import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth';

/**
 * Auth gate. The root layout keeps the splash screen up until the stored
 * session has loaded (`isInitialized`), so by the time this renders the
 * redirect target is already known.
 */
export default function Index() {
  const session = useAuthStore((state) => state.session);

  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/(auth)/welcome" />;
}
