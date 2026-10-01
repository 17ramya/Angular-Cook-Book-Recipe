/** The two account types a visitor can pick when signing up. */
export type UserRole = 'admin' | 'customer';

export const ADMIN_ROLE: UserRole = 'admin';
export const CUSTOMER_ROLE: UserRole = 'customer';

/**
 * Least privileged role. An account whose role cannot be resolved (for
 * example a session created before roles existed) is treated as a read-only
 * customer rather than being silently granted edit rights.
 */
export const DEFAULT_USER_ROLE: UserRole = CUSTOMER_ROLE;

export interface UserRoleOption {
  value: UserRole;
  label: string;
  tagline: string;
  description: string;
  /** Whether this role may create, edit and delete recipes. */
  canManageRecipes: boolean;
}

/** Drives the sign-up role picker — order is the order shown in the UI. */
export const USER_ROLE_OPTIONS: UserRoleOption[] = [
  {
    value: CUSTOMER_ROLE,
    label: 'Customer',
    tagline: 'View only',
    description:
      'Browse recipes, open the details and send ingredients to your shopping list.',
    canManageRecipes: false,
  },
  {
    value: ADMIN_ROLE,
    label: 'Admin',
    tagline: 'Full access',
    description:
      'Everything a customer can do, plus create, edit and delete recipes.',
    canManageRecipes: true,
  },
];

/** Narrows an untrusted value (e.g. parsed JSON) to a known role. */
export function isUserRole(value: unknown): value is UserRole {
  return value === ADMIN_ROLE || value === CUSTOMER_ROLE;
}
