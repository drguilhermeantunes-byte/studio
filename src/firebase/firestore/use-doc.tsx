'use client';
import { useEffect, useState } from 'react';
import { onSnapshot, DocumentReference } from 'firebase/firestore';

export function useDoc<T>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setData(snapshot.data() ?? null);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching document:", error);
      setData(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ref?.path]);

  return { data, loading };
}
