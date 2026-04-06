import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCustomClaims, CustomClaims } from '@/lib/auth/claims';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshClaims = async (currentUser: User) => {
    // Force refresh the ID token to get updated custom claims (Task 7)
    await currentUser.getIdToken(true);
    const customClaims = await getCustomClaims(currentUser);
    setClaims(customClaims);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Initial claim fetch
        const customClaims = await getCustomClaims(user);

        // If claims are missing or in 'pending' state, attempt one refresh
        if (!customClaims || customClaims.tenantId === 'pending') {
          console.log('User claims pending. Attempting refresh...');
          await refreshClaims(user);
        } else {
          setClaims(customClaims);
        }
      } else {
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, claims, loading, tenantId: claims?.tenantId, refreshClaims };
}
