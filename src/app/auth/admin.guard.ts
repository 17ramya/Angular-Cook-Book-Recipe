import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from './auth.service';

/**
 * Blocks the recipe authoring routes (`/recipes/new`, `/recipes/:id/edit`) for
 * signed-in customers. Anonymous visitors are sent to the auth page, customers
 * are sent back to the overview. Guards run before resolvers, so a customer
 * never even fetches the recipe list for an edit link.
 */
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.authService.user.pipe(
      take(1),
      map((user) => {
        if (user && user.isAdmin) {
          return true;
        }

        return this.router.createUrlTree(user ? ['/recipes'] : ['/auth']);
      })
    );
  }
}
