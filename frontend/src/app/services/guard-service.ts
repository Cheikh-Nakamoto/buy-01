// guard.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardService {
  constructor(private authService: AuthService, private router: Router) { }

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