import { createHash, randomBytes } from 'crypto'

export const RATING_TOKEN_TTL_DAYS = 7

export function generateRatingToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(24).toString('base64url')
  return {
    token,
    tokenHash: hashRatingToken(token),
    expiresAt: new Date(Date.now() + RATING_TOKEN_TTL_DAYS * 86_400_000),
  }
}

export function hashRatingToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
