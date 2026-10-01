import { TestBed } from '@angular/core/testing';

import {
  ADMIN_ROLE,
  CUSTOMER_ROLE,
  DEFAULT_USER_ROLE,
} from './user-role.model';
import { UserRoleService } from './user-role.service';

const STORAGE_KEY = 'recipeBook.userRoles';

describe('UserRoleService', () => {
  let service: UserRoleService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRoleService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('treats the customer role as the least privileged default', () => {
    expect(DEFAULT_USER_ROLE).toBe(CUSTOMER_ROLE);
  });

  it('resolves an unknown email to the read-only customer role', () => {
    expect(service.getRole('nobody@example.com')).toBe(CUSTOMER_ROLE);
    expect(service.isAdmin('nobody@example.com')).toBeFalse();
  });

  it('resolves a missing email to the read-only customer role', () => {
    expect(service.getRole('')).toBe(CUSTOMER_ROLE);
    expect(service.isAdmin('')).toBeFalse();
  });

  it('remembers the role chosen at sign up', () => {
    service.setRole('admin@example.com', ADMIN_ROLE);

    expect(service.getRole('admin@example.com')).toBe(ADMIN_ROLE);
    expect(service.isAdmin('admin@example.com')).toBeTrue();
  });

  it('remembers a customer sign up as view-only', () => {
    service.setRole('shopper@example.com', CUSTOMER_ROLE);

    expect(service.getRole('shopper@example.com')).toBe(CUSTOMER_ROLE);
    expect(service.isAdmin('shopper@example.com')).toBeFalse();
  });

  it('matches emails case-insensitively and ignores padding', () => {
    service.setRole('Admin@Example.com', ADMIN_ROLE);

    expect(service.getRole('admin@example.com')).toBe(ADMIN_ROLE);
    expect(service.getRole('  ADMIN@EXAMPLE.COM  ')).toBe(ADMIN_ROLE);
  });

  it('keeps every account on its own role', () => {
    service.setRole('admin@example.com', ADMIN_ROLE);
    service.setRole('shopper@example.com', CUSTOMER_ROLE);

    expect(service.isAdmin('admin@example.com')).toBeTrue();
    expect(service.isAdmin('shopper@example.com')).toBeFalse();
  });

  it('can promote a customer account to admin', () => {
    service.setRole('x@y.com', CUSTOMER_ROLE);
    expect(service.isAdmin('x@y.com')).toBeFalse();

    service.setRole('x@y.com', ADMIN_ROLE);
    expect(service.isAdmin('x@y.com')).toBeTrue();
  });

  it('ignores an unrecognised stored role', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 'x@y.com': 'superuser' })
    );

    expect(service.getRole('x@y.com')).toBe(CUSTOMER_ROLE);
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem(STORAGE_KEY, 'definitely not json');

    expect(service.getRole('x@y.com')).toBe(CUSTOMER_ROLE);
  });
});
