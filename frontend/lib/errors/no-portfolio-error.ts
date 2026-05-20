/** El usuario autenticado no tiene ningún portafolio creado. */
export class NoPortfolioError extends Error {
  constructor(message = 'No portfolio found for the current user') {
    super(message)
    this.name = 'NoPortfolioError'
  }
}

export function isNoPortfolioError(error: unknown): boolean {
  return error instanceof NoPortfolioError
}
