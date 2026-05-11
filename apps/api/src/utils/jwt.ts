import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  const options = {
    expiresIn: env.jwtAccessExpires,
  } as SignOptions;
  return jwt.sign(payload, env.jwtAccessSecret as Secret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options = {
    expiresIn: env.jwtRefreshExpires,
  } as SignOptions;
  return jwt.sign(payload, env.jwtRefreshSecret as Secret, options);
}

export function verifyAccess(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}

export function verifyRefresh(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}
