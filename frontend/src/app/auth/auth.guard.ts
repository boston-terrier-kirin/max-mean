import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, skipWhile, take, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.authService.getAuthStatus().pipe(
      // AuthServiceでチェック中はnullなのでスキップする。
      skipWhile((value) => value === null),
      // signedin$はcompleteしないので、take(1)する。
      take(1),
      // ログインしていなければ、/ に遷移させる。
      tap((authenticated) => {
        if (!authenticated) {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
