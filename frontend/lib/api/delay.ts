/** Simula latencia de red en servicios mock */
export const mockDelay = (ms = 280) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))
