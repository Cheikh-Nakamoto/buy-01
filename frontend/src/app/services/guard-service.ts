// guard.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if the user is authenticated
    return this.authService.checkAuth().then(authenticated => {
      if (authenticated) {
        return true;
      } else {
        return this.router.createUrlTree(['/auth'], {
          queryParams: { returnUrl: state.url }
        });
      }
    });
  }
}