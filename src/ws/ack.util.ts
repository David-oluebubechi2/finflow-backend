import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

export type AckFn = (res: unknown) => void

export function errorMessage(err: unknown): string {
  if (!err) return 'Unexpected error.'
  if (typeof err === 'string') return err
  const message = (err as { message?: unknown } | null)?.message
  return typeof message === 'string' && message.trim() ? message : 'Unexpected error.'
}

export async function respond<T>(ack: AckFn | undefined, fn: () => Promise<T> | T): Promise<void> {
  try {
    const data = await Promise.resolve(fn())
    ack?.({ ok: true, data })
  } catch (err) {
    ack?.({ ok: false, error: errorMessage(err) })
  }
}

export async function validateDto<T extends object>(cls: new () => T, raw: unknown): Promise<T> {
  const dto = plainToInstance(cls, (raw ?? {}) as Record<string, unknown>)
  const errors = await validate(dto as object)
  if (errors.length > 0) {
    const constraints = errors[0]?.constraints
    const first = constraints ? Object.values(constraints)[0] : 'Validation failed.'
    throw new Error(first)
  }
  return dto
}