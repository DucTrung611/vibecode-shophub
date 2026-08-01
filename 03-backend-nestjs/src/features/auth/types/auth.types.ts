export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: number;
}
