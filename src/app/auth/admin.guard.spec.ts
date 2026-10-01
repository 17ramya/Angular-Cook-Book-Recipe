import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { User } from './user.model';
import { ADMIN_ROLE, CUSTOMER_ROLE } from './user-role.model';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: AuthService;
  let router: Router;

  const inAnHour = () => new Date(new Date().getTime() + 60 * 60 * 1000);

  const activate = (): boolean | UrlTree => {
    const activation = guard.canActivate(
      null,
      null
    ) as Observable<boolean | UrlTree>;

    let outcome: boolean | UrlTree;
    activation.pipe(take(1)).subscribe((value) => (outcome = value));
    return outcome;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });

    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('lets an admin reach the recipe editor', () => {
    authService.user.next(
      new User('admin@example.com', 'id', 'token', inAnHour(), ADMIN_ROLE)
    );

    expect(activate()).toBeTrue();
  });

  it('sends a signed-in customer back to the recipe overview', () => {
    authService.user.next(
      new User('shopper@example.com', 'id', 'token', inAnHour(), CUSTOMER_ROLE)
    );

    const outcome = activate();

    expect(outcome instanceof UrlTree).toBeTrue();
    expect((outcome as UrlTree).toString()).toBe('/recipes');
    expect(outcome).toEqual(router.parseUrl('/recipes'));
  });

  it('sends an anonymous visitor to the auth page', () => {
    authService.user.next(null);

    const outcome = activate();

    expect(outcome instanceof UrlTree).toBeTrue();
    expect((outcome as UrlTree).toString()).toBe('/auth');
  });
});
