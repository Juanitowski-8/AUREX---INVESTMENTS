/**
 * @deprecated Importar desde `@/lib/api-client`.
 * Re-export temporal para compatibilidad.
 */
export {
  apiClient,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  ApiError,
  AUTH_TOKEN_KEY,
  clearAuthToken,
  getAuthToken,
  isNetworkError,
  setAuthToken,
  type ApiEnvelope,
  type ApiRequestOptions,
} from '@/lib/api-client'
