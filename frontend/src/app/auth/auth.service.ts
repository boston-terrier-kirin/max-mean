import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userId: string | null = null;
  private token: string | null = null;
  private authStatus = new BehaviorSubject<boolean>(false);
  private tokenTimer: any | null = null;

  constructor(private httpClient: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    return this.httpClient.post(
      'http://localhost:3000/api/user/signup',
      authData
    );
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.httpClient
      .post<{ token: string; expiresIn: number; userId: string }>(
        'http://localhost:3000/api/user/login',
        authData
      )
      .subscribe((response) => {
        const expiresIn = response.expiresIn;
        this.setAuthTimer(expiresIn);

        this.userId = response.userId;
        this.token = response.token;
        this.authStatus.next(true);

        this.saveAuthData(
          this.token,
          new Date(new Date().getTime() + expiresIn * 1000),
          this.userId
        );

        this.router.navigate(['/']);
      });
  }

  autoAuthUser() {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }

    const expiresIn = authData.expirationDate.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.userId = authData.userId;
      this.token = authData.token;
      this.authStatus.next(true);
      this.setAuthTimer(expiresIn / 1000);
    }
  }

  logout() {
    clearTimeout(this.tokenTimer);

    this.userId = null;
    this.token = null;
    this.authStatus.next(false);
    this.clearAuthData();

    this.router.navigate(['/']);
  }

  getToken() {
    return this.token;
  }

  getAuthStatus() {
    return this.authStatus.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  private setAuthTimer(expiresIn: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expiresIn * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate || !userId) {
      return;
    }

    return { token, expirationDate: new Date(expirationDate), userId };
  }
}
