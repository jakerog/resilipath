/**
 * ResiliPath - Security & Protection Utilities
 */

import * as admin from 'firebase-admin';

/**
 * Simple Firestore-based rate limiting (Token Bucket)
 * Prevents brute-force on sensitive discovery/webhook endpoints.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  const db = admin.firestore();
  const limitRef = db.collection('rate_limits').doc(key);

  try {
    const isAllowed = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(limitRef);
      const now = Date.now();
      const windowMs = windowSeconds * 1000;

      if (!doc.exists) {
        transaction.set(limitRef, {
          count: 1,
          resetAt: now + windowMs
        });
        return true;
      }

      const data = doc.data()!;
      if (now > data.resetAt) {
        transaction.update(limitRef, {
          count: 1,
          resetAt: now + windowMs
        });
        return true;
      }

      if (data.count < maxRequests) {
        transaction.update(limitRef, {
          count: data.count + 1
        });
        return true;
      }

      return false;
    });

    return isAllowed;
  } catch (error) {
    console.error('Rate limit check failed, allowing by default:', error);
    return true;
  }
}

/**
 * Sensitive Data Masking for Audit Logs
 * Redacts emails and phone numbers in metadata.
 */
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const masked = { ...data };

  // Common sensitive keys
  const sensitiveKeys = ['email', 'phone', 'secret', 'token', 'password', 'ssoUrl'];

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      if (typeof masked[key] === 'string') {
        const val = masked[key];
        if (val.includes('@')) {
          // Mask Email: a***@domain.com
          const [name, domain] = val.split('@');
          masked[key] = `${name[0]}***@${domain}`;
        } else if (val.length > 5) {
          // Mask generic: ****last4
          masked[key] = `****${val.slice(-4)}`;
        } else {
          masked[key] = '****';
        }
      } else {
        masked[key] = '[REDACTED]';
      }
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}
