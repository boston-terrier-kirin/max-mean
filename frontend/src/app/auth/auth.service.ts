import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private authStatus = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.httpClient
      .post('http://localhost:3000/api/user/signup', authData)
      .subscribe((response) => {
        console.log(response);
        this.router.navigate(['/']);
      });
  }

  logout() {
    this.token = null;
    this.authStatus.next(false);
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.httpClient
      .post<{ token: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe((response) => {
        this.token = response.token;
        this.authStatus.next(true);
        this.router.navigate(['/']);
      });
  }

  getToken() {
    return this.token;
  }

  getAuthStatus() {
    return this.authStatus.asObservable();
  }
}
