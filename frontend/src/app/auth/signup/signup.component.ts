import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  error = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {}

  signup() {
    if (this.form.invalid) {
      return;
    }

    this.authService
      .signup(this.form.value.email, this.form.value.password)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.log('★', error);
          this.error = 'ERROR';
        },
      });
  }
}
