import { User } from 'firebase/auth';

export interface CustomClaims {
  tenantId: string;
  role: 'Admin' | 'Moderator' | 'User' | 'Report';
  tier: 'standard' | 'enterprise' | 'elite';
  isGlobalSuperUser?: boolean;
}

/**
 * Extracts and validates custom claims from a Firebase User.
 * This is the client-side equivalent of the Firestore security rules isolation logic.
 */
export async function getCustomClaims(user: User): Promise<CustomClaims | null> {
  try {
    const idTokenResult = await user.getIdTokenResult();
    const claims = idTokenResult.claims as any;

    if (!claims.tenantId || !claims.role) {
      console.warn('User missing mandatory custom claims (tenantId or role).');
      return null;
    }

    return {
      tenantId: claims.tenantId,
      role: claims.role,
      tier: claims.tier || 'standard',
      isGlobalSuperUser: !!claims.isGlobalSuperUser,
    };
  } catch (error) {
    console.error('Failed to extract custom claims:', error);
    return null;
  }
}

/**
 * Helper to validate if a user belongs to a specific tenant.
 */
export function belongsToTenant(claims: CustomClaims | null, tenantId: string): boolean {
  if (!claims) return false;
  return claims.isGlobalSuperUser || claims.tenantId === tenantId;
}

/**
 * Helper to validate RBAC roles.
 */
export function hasRequiredRole(
  claims: CustomClaims | null,
  requiredRole: 'Admin' | 'Moderator' | 'User' | 'Report'
): boolean {
  if (!claims) return false;
  if (claims.isGlobalSuperUser) return true;

  const roles = ['Report', 'User', 'Moderator', 'Admin'];
  const userRoleIndex = roles.indexOf(claims.role);
  const requiredRoleIndex = roles.indexOf(requiredRole);

  return userRoleIndex >= requiredRoleIndex;
}
