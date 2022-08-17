import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  login() {
    if (this.form.invalid) {
      return;
    }

    this.authService.login(this.form.value.email, this.form.value.password);
  }
}
