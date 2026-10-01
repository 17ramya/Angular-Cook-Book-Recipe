import { Injectable } from '@angular/core';

import {
  ADMIN_ROLE,
  DEFAULT_USER_ROLE,
  isUserRole,
  UserRole,
} from './user-role.model';

/** localStorage key holding the `email -> role` map. */
const STORAGE_KEY = 'recipeBook.userRoles';

type StoredRoles = { [email: string]: UserRole };

/**
 * Remembers which role an email signed up with.
 *
 * Firebase's REST sign-up endpoint cannot attach a custom claim without the
 * Admin SDK, so the chosen role is kept locally per email address. Emails with
 * no remembered role always resolve to the read-only customer role.
 */
@Injectable({ providedIn: 'root' })
export class UserRoleService {
  getRole(email: string): UserRole {
    if (!email) {
      return DEFAULT_USER_ROLE;
    }

    const stored = this.readAll()[this.normalize(email)];
    return isUserRole(stored) ? stored : DEFAULT_USER_ROLE;
  }

  setRole(email: string, role: UserRole): void {
    if (!email) {
      return;
    }

    const roles = this.readAll();
    roles[this.normalize(email)] = isUserRole(role)
      ? role
      : DEFAULT_USER_ROLE;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }

  isAdmin(email: string): boolean {
    return this.getRole(email) === ADMIN_ROLE;
  }

  /** Firebase lowercases addresses, so keys are normalised the same way. */
  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  private readAll(): StoredRoles {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      // Corrupted or unreadable storage: fall back to "no roles known".
      return {};
    }
  }
}
