import { useEffect, useState } from 'react'

/**
 * Loads async service data on the client after mount.
 * Prepared for later swap to TanStack Query against Spring Boot.
 */
export function useMountedService<T>(
  loader: () => Promise<T>,
  initialValue: T
): T {
  const [data, setData] = useState<T>(initialValue)

  useEffect(() => {
    let cancelled = false

    loader().then((result) => {
      if (!cancelled) setData(result)
    })

    return () => {
      cancelled = true
    }
    // Loader is intentionally run once on mount (mock → API migration point)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return data
}
