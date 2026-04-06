import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestoreQuery<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: { realtime?: boolean; enabled?: boolean } = { realtime: true, enabled: true }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.enabled === false) {
      setLoading(false);
      return;
    }

    let q;
    try {
      q = query(collection(db, collectionName), ...constraints);
    } catch (err) {
      console.error(`Error creating query for ${collectionName}:`, err);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real-time listener (Default)
    if (options.realtime !== false) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as T[];
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }

    // One-time fetch for non-realtime views (Optimization)
    const fetchData = async () => {
      try {
        const { getDocs } = await import('firebase/firestore');
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(items);
      } catch (err: any) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, constraints.length, options.realtime, options.enabled]);

  return { data, loading, error };
}
