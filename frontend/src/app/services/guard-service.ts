// guard.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * Guard service to protect routes based on user authentication status and role.
 * Implements the `CanActivate` interface to control access to routes.
 */
export class GuardService {
  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Determines if a route can be activated.
   * Checks user authentication and role-based access.
   * @param route The activated route snapshot.
   * @param state The router state snapshot.
   * @returns A boolean, UrlTree, Observable, or Promise indicating if the route can be activated.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.checkAuth().then(authenticated => {
      if (!authenticated) {
        return this.router.createUrlTree(['/auth'], {
          queryParams: { returnUrl: state.url }
        });
      }

      const user = this.authService.currentUser$(); // Supposons que cette méthode existe
      const allowedRoutesForClient = ['/', '/profile'];

      if (user?.role === 'CLIENT' && !allowedRoutesForClient.includes(state.url)) {
        // Rediriger vers une page autorisée ou retourner false
        return this.router.createUrlTree(['/']); // Ou return false;
      }

      return true;
    });
  }
}