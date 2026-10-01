import { User } from './user.model';
import {
  ADMIN_ROLE,
  CUSTOMER_ROLE,
  DEFAULT_USER_ROLE,
} from './user-role.model';

describe('User', () => {
  const inAnHour = () => new Date(new Date().getTime() + 60 * 60 * 1000);

  it('is not an admin when built without an explicit role', () => {
    const user = new User('a@b.com', 'id', 'token', inAnHour());

    expect(user.role).toBe(DEFAULT_USER_ROLE);
    expect(user.isAdmin).toBeFalse();
  });

  it('is an admin only when created with the admin role', () => {
    const admin = new User('a@b.com', 'id', 'token', inAnHour(), ADMIN_ROLE);
    const customer = new User('a@b.com', 'id', 'token', inAnHour(), CUSTOMER_ROLE);

    expect(admin.isAdmin).toBeTrue();
    expect(customer.isAdmin).toBeFalse();
  });

  it('still exposes a valid token before it expires', () => {
    const user = new User('a@b.com', 'id', 'token', inAnHour());

    expect(user.token).toBe('token');
  });

  it('keeps its role through the persisted session round trip', () => {
    const user = new User('a@b.com', 'id', 'token', inAnHour(), ADMIN_ROLE);
    const restored: { email: string; role: string } = JSON.parse(
      JSON.stringify(user)
    );

    expect(restored.role).toBe(ADMIN_ROLE);
    expect(restored.email).toBe('a@b.com');
  });
});
