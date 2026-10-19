import { useState, useEffect } from 'react';

/**
 * Simulates an async loading state for a given duration.
 * TEMPORARY — replace with real API loading state when backend is connected.
 */
export function useSimulatedLoad(ms = 600): boolean {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  
  return loading;
}
