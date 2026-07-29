import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLock } from '../../contexts/LockContext';
import { EcranVerrouillage } from '../../components/EcranVerrouillage';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { estVerrouille } = useLock();

  if (loading) return null;
  if (!user) return <Redirect href="/connexion" />;
  if (estVerrouille) return <EcranVerrouillage />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ajouter" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
