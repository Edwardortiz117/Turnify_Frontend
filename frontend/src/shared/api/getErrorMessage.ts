import { ApiError } from '../api/ApiError'

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Ocurrió un error inesperado.'
}
