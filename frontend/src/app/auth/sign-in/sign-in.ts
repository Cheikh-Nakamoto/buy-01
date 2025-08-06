import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ToastError } from "../../error/toast-error/toast-error";
import { ServiceResponse } from '../../models/interfaces';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, ReactiveFormsModule, ToastError],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
/**
 * Component for user sign-in and sign-up.
 * Manages authentication forms, user input, and interaction with the authentication service.
 */
export class SignIn implements OnInit {
  authForm: FormGroup;
  isSignUp = signal(false);
  loading = signal(false);
  avatarPreview: string | ArrayBuffer | null = null;
  selectedAvatarFile!: File;
  canHide = signal<boolean>(true);

  // Nouvelles propriétés pour la gestion d'état des messages
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Computed pour créer l'objet de statut des messages
  messageStatus = computed(() => ({
    error: this.errorMessage(),
    success: this.successMessage()
  }));

  // Effect pour logger les changements de messages (optionnel)
  private messageLoggerEffect = effect(() => {
    console.log('DEBUG - Nouveau statut des messages d\'authentification :', this.messageStatus());
  });

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

  /**
   * Handles the selection of an avatar file.
   * Performs client-side validation and displays a preview of the selected image.
   * @param event The DOM event triggered by the file input change.
   */
  onAvatarSelected(event: any) {
    const file = event.target.files[0];

    if (file && file instanceof File) {
      console.log('Avatar input changed:', file);

      // Validation
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        this.errorMessage.set('File too large. Maximum size is 5MB.');
        this.clearMessages(3000);
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Please select a valid image file.');
        this.clearMessages(3000);
        return;
      }

      // Stocker le fichier dans une propriété séparée
      this.selectedAvatarFile = file;

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Marquer le champ comme touché pour la validation
      this.authForm.get('avatar')?.markAsTouched();
    }
  }

  /**
   * Initializes and returns the authentication form with its controls and validators.
   * @returns The initialized FormGroup for the authentication form.
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''],
      role: ['CLIENT', Validators.required],
      avatar: [null]
    });
  }

  /**
  * Réinitialise complètement le formulaire d'authentification,
  * nettoie l'avatar et efface les messages.
  */
  resetForm(role?: string): void {
    this.authForm.reset({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: role || 'CLIENT',
      avatar: null
    });
  }

  /**
   * Nettoie complètement l'avatar input et remet à zéro tous les états liés
   */
  private cleanAvatarInput(): void {
    // Réinitialiser la valeur du FormControl
    this.authForm.get('avatar')?.setValue(null);
    this.authForm.get('avatar')?.markAsUntouched();
    this.authForm.get('avatar')?.markAsPristine();

    // Nettoyer les propriétés de prévisualisation
    this.avatarPreview = null;
    this.selectedAvatarFile = null as any;

    // Optionnel : Nettoyer physiquement l'input file dans le DOM
    const avatarInput = document.querySelector('input[type="file"][formControlName="avatar"]') as HTMLInputElement;
    if (avatarInput) {
      avatarInput.value = '';
    }

    console.log('Avatar input cleaned');
  }

  /**
   * Toggles the visibility of the avatar input based on the selected role.
   * Cleans the avatar input if switching to a role that doesn't require it (e.g., CLIENT).
   * @param even Optional string indicating the role to toggle to.
   */
  toggle(even?: string) {
    if (even != "SELLER") {
      this.canHide.set(true);
      return;
    }
    // Nettoyer l'avatar quand on passe en mode CLIENT
    this.canHide.set(false);
    this.cleanAvatarInput();
  }

  /**
   * Toggles between sign-in and sign-up modes.
   * Adjusts form validators and clears messages accordingly.
   */
  toggleMode(): void {
    this.isSignUp.set(!this.isSignUp());
    // Nettoyer les messages lors du changement de mode
    this.clearMessages(0);
    console.log('Toggled sign-up mode:', this.isSignUp());
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

  /**
   * Custom validator to check if the 'password' and 'confirmPassword' fields match.
   * @param control The FormControl for 'confirmPassword'.
   * @returns A validation error object if passwords do not match, otherwise null.
   */
  private passwordMatchValidator(control: any): any {
    const password = this.authForm?.get('password')?.value;
    const confirmPassword = control.value;

    if (password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  /**
   * Handles the form submission for both sign-in and sign-up.
   * Validates the form, interacts with the authentication service, and manages UI state.
   */
  async onSubmit(): Promise<void> {
    // Validation du formulaire
    if (this.authForm.invalid) {
      this.markAllFieldsAsTouched();
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formData = this.authForm.value;

      if (this.isSignUp()) {
        // Inscription
        let err: ServiceResponse = await this.authService.signUp(formData, this.selectedAvatarFile);
        if (!err.success) {
          this.errorMessage.set(err.error || 'An error occurred during sign-up.');
          this.loading.set(false);
          return;
        }

        this.successMessage.set('Sign up successful! You can now sign in.');
        // Petit délai pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          this.toggleMode();
          this.successMessage.set('');
        }, 1500);

      } else {
        // Connexion
        const res = await this.authService.signIn(formData);
        if (!res.success) {
          this.errorMessage.set(res.error || 'An error occurred during sign-in.');
          this.loading.set(false);
          this.resetForm();
          return;
        }

        // Si on arrive ici, c'est que la connexion a réussi
        this.successMessage.set('Sign in successful! Redirecting...');

        // Petit délai pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);

      // Gestion spécifique des erreurs d'authentification
      this.errorMessage.set(error?.error || error?.message || 'An unexpected error occurred. Please try again.');

    } finally {
      this.loading.set(false);
    }
  }


  /**
   * Marks all form fields as touched to trigger validation messages.
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.authForm.controls).forEach(key => {
      this.authForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Clears success and error messages after a specified delay.
   * If delay is 0, messages are cleared immediately.
   * @param delay The time in milliseconds after which to clear the messages. Defaults to 0.
   */
  private clearMessages(delay: number = 0): void {
    if (delay === 0) {
      this.errorMessage.set('');
      this.successMessage.set('');
    } else {
      setTimeout(() => {
        this.errorMessage.set('');
        this.successMessage.set('');
      }, delay);
    }
  }

  
}