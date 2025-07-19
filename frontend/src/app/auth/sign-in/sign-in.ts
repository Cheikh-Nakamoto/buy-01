import { Component } from '@angular/core';
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
export class SignIn {
 authForm: FormGroup;
  isSignUp = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''],
      role: ['buyer']
    });
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    
    if (this.isSignUp) {
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

  onSubmit(): void {
    if (this.authForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const formData = this.authForm.value;

    if (this.isSignUp) {
      this.authService.signUp(formData)
    } else {
      this.authService.signIn(formData.email, formData.password).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error: { message: string; }) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
    }
  }
}
