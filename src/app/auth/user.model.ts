import { ADMIN_ROLE, DEFAULT_USER_ROLE, UserRole } from './user-role.model';

export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date,
    public role: UserRole = DEFAULT_USER_ROLE
  ) {}

  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }

  /** Admins may create, edit and delete recipes; everyone else is view-only. */
  get isAdmin(): boolean {
    return this.role === ADMIN_ROLE;
  }
}
