/**
 * Task 8: Client-Side Auth Logic
 * ResiliPath - Identity & Access Management
 *
 * Logic to listen for and verify custom claims in the ID token.
 */

/**
 * Interface representing the custom claims stored in the ID token.
 */
export interface UserCustomClaims {
  tenantId: string;
  role: 'Admin' | 'User' | 'Report' | 'Moderator';
  tier: 'standard' | 'enterprise' | 'elite';
  isGlobalSuperUser?: boolean;
}

/**
 * Validates the custom claims from the ID token.
 * (Note: Real validation occurs on the server, this is for UI-level consistency).
 */
export function validateCustomClaims(claims: any): claims is UserCustomClaims {
  const hasTenantId = typeof claims.tenantId === 'string' && claims.tenantId !== '';
  const hasValidRole = ['Admin', 'User', 'Report', 'Moderator'].includes(claims.role);
  const hasValidTier = ['standard', 'enterprise', 'elite'].includes(claims.tier);

  return hasTenantId && hasValidRole && hasValidTier;
}

/**
 * Extracts custom claims from a decoded ID token.
 */
export function extractCustomClaims(decodedToken: any): UserCustomClaims | null {
  const claims = {
    tenantId: decodedToken.tenantId,
    role: decodedToken.role,
    tier: decodedToken.tier,
    isGlobalSuperUser: decodedToken.isGlobalSuperUser,
  };

  if (validateCustomClaims(claims)) {
    return claims;
  }

  return null;
}
