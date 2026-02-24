'use client';
import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, Query } from 'firebase/firestore';

export function useCollection<T>(q: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  const queryKey = useMemo(() => q ? JSON.stringify(q) : null, [q]);

  useEffect(() => {
    if (!q) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: any[] = [];
      snapshot.forEach(doc => result.push({ id: doc.id, ...doc.data() }));
      setData(result as T[]);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching collection:", error);
      setData(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [queryKey]);

  return { data, loading };
}
