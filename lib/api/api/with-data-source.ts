import { ApiError, isNetworkError } from '@/lib/api-client'
import { IS_MOCK_MODE } from '@/lib/config'

export type WithDataSourceOptions = {
  /** Si el API falla (red/5xx), usar mock para no romper la UI. Por defecto true. */
  fallbackToMockOnError?: boolean
}

function shouldFallback(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 0 || error.status >= 500
  }
  return isNetworkError(error)
}

/**
 * Ejecuta mock o API según `NEXT_PUBLIC_DATA_MODE`.
 * En modo api, opcionalmente vuelve a mock si el backend no está disponible.
 */
export async function withDataSource<T>(
  mock: () => Promise<T>,
  live: () => Promise<T>,
  options: WithDataSourceOptions = {}
): Promise<T> {
  const { fallbackToMockOnError = true } = options

  if (IS_MOCK_MODE) {
    return mock()
  }

  try {
    return await live()
  } catch (error) {
    if (fallbackToMockOnError && shouldFallback(error)) {
      console.warn('[Aurex] API no disponible; usando datos mock.', error)
      return mock()
    }
    throw error
  }
}
