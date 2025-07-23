import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn implements OnInit {
  authForm: FormGroup;
  isSignUp = signal(false);
  loading = signal(false);
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.createForm();
  }
  async ngOnInit(): Promise<void> {
    // If the user is already signed in, redirect to home page
    await this.authService.checkAuth();
    if (this.authService.isSignIn$()) {
      this.router.navigate(['/']);
      return;
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''],
      role: ['CLIENT', Validators.required]
    });
  }

  toggleMode(): void {
    this.isSignUp.set(!this.isSignUp());
    this.errorMessage = '';

    if (this.isSignUp()) {
      this.authForm.get('name')?.setValidators([Validators.required]);
      this.authForm.get('confirmPassword')?.setValidators([Validators.required, this.passwordMatchValidator.bind(this)]);
    } else {
      this.authForm.get('name')?.clearValidators();
      this.authForm.get('confirmPassword')?.clearValidators();
    }

    this.authForm.get('name')?.updateValueAndValidity();
    this.authForm.get('confirmPassword')?.updateValueAndValidity();
  }

  private passwordMatchValidator(control: any): any {
    const password = this.authForm?.get('password')?.value;
    const confirmPassword = control.value;

    if (password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) return;

    this.loading.set(true);
    this.errorMessage = '';

    const formData = this.authForm.value;

    if (this.isSignUp()) {
      await this.authService.signUp(formData);
      this.toggleMode();
    } else {
      await this.authService.signIn(formData);
    }
    this.loading.set(false);
    this.router.navigate(['/']);
  }
}
