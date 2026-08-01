export function refreshTokenKey(userId: number): string {
  return `refresh:user:${userId}`;
}
