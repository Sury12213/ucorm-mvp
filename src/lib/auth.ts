import { SignJWT, jwtVerify } from 'jose';

export const authCookieName = 'ucorm_admin_session';

type SessionPayload = {
  adminId: string;
  username: string;
};

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error('Missing AUTH_SECRET');
}

const secretKey = new TextEncoder().encode(secret);

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secretKey);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);

  if (typeof payload.adminId !== 'string' || typeof payload.username !== 'string') {
    return null;
  }

  return {
    adminId: payload.adminId,
    username: payload.username,
  };
}
