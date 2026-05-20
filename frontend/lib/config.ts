/**
 * Aurex — configuración pública del frontend.
 *
 * Solo variables con prefijo NEXT_PUBLIC_ (expuestas al navegador).
 * No añadir API keys, secretos JWT ni credenciales de proveedores aquí.
 */

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api'

/** Base URL del API REST de Spring Boot (sin barra final). */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, '')

export type DataMode = 'mock' | 'api'

/**
 * Fuente de datos: `mock` (local) o `api` (Spring Boot).
 * `NEXT_PUBLIC_DATA_MODE=api` activa fetch al backend.
 */
export const DATA_MODE: DataMode =
  process.env.NEXT_PUBLIC_DATA_MODE === 'api' ? 'api' : 'mock'

/** `true` cuando los servicios deben usar datos mock. */
export const IS_MOCK_MODE = DATA_MODE !== 'api'

/**
 * @deprecated Usar `IS_MOCK_MODE` / `NEXT_PUBLIC_DATA_MODE`.
 * `NEXT_PUBLIC_USE_MOCK_API=false` fuerza modo api si `DATA_MODE` no está definido.
 */
export const USE_MOCK_API =
  process.env.NEXT_PUBLIC_DATA_MODE === 'api'
    ? false
    : process.env.NEXT_PUBLIC_USE_MOCK_API === 'false'
      ? false
      : IS_MOCK_MODE
