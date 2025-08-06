import { Component, signal, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../models/interfaces';
import { UserService } from '../services/user-service';
import { UpdateForm } from './update-form/update-form';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { handleHttpError } from '../utils/utils';
import { computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, 
    MatIconModule,
    MatButtonModule
  ],
  providers: [HttpClient],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user = signal<User | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  messageStatus = computed(() => ({
    error: this.errorMessage(),
    success: this.successMessage()
  }));

  constructor(private userService: UserService, private dialog: MatDialog) { }

  ngOnInit() {
    this.loadUserProfile();
  }

  /**
   * Charge le profil utilisateur
   */
  private loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        console.log('User profile loaded:', user);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.errorMessage.set(error.message);
      }
    });
    console.log('Profile component initialized');
  }

  /**
   * Returns the CSS background-image URL for the user's avatar, if available.
   * @returns A string representing the CSS background-image URL, or an empty string if no avatar.
   */
  getBackgroundImage(): string {
    if (this.user()?.avatar) {
      return `url(${this.user()!.avatar})`;
    }
    // Retourne une image de fond par défaut
    return 'url(https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)';
  }

  /**
   * Generates initials from a full name.
   * Takes the first two characters of the first two words, converts to uppercase.
   * @param name The full name of the user.
   * @returns A string representing the user's initials.
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Returns the French label for a given user role.
   * @param role The user's role ('CLIENT' or 'SELLER').
   * @returns The localized role label ('Acheteur' or 'Vendeur').
   */
  getRoleLabel(role: 'CLIENT' | 'SELLER'): string {
    return role === 'CLIENT' ? 'Acheteur' : 'Vendeur';
  }

  /**
   * Formats a date into a localized string (French locale).
   * @param date The date to format, can be a Date object, string, null, or undefined.
   * @returns The formatted date string, or 'Date non disponible' if the date is invalid.
   */
  getFormattedDate(date: Date | string | null | undefined): string {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Date non disponible';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  /**
   * Calculates the age of the account based on the creation date.
   * @param createdAt The creation date of the account.
   * @returns A string representing the account's age (e.g., 'X jours', 'Y mois', 'Z ans').
   */
  getAccountAge(createdAt: Date): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  }

  /**
   * Opens the dialog for updating the user's profile and avatar.
   * Subscribes to the dialog's `afterClosed` event to handle the result.
   */
  openUploadDialog(): void {
    const dialogRef = this.dialog.open(UpdateForm, {
      width: '800px',
      data: { user: this.user() }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('Dialog closed with result:', result);
      if (result) {
        this.handleSave(result);
      }
    });
  }

  /**
   * Handles the saving of updated user data, including avatar and profile information.
   * Orchestrates the update process, manages loading states, and handles success/error messages.
   * @param updatedData The FormData object containing the updated user and/or avatar data.
   */
  async handleSave(updatedData: FormData) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const currentUser = this.user();
      if (!currentUser) throw new Error('User data not available');

      const [avatarResult, profileResult] = await Promise.allSettled([
        this.processAvatarUpdate(updatedData),
        this.processProfileUpdate(updatedData, currentUser)
      ]);
      console.log('Profile update result:', profileResult);

      this.handleUpdateResults(avatarResult, profileResult);
    } catch (error) {
      this.handleSaveError(error);
    } finally {
      this.isLoading.set(false);
      this.clearMessagesAfterDelay();
    }
  }

  /**
   * Processes the avatar update if a new avatar file is provided in the FormData.
   * Calls the `userService` to update the avatar.
   * @param updatedData The FormData object potentially containing the new avatar file.
   * @returns A Promise that resolves when the avatar update is complete.
   * @throws Error if the avatar update fails.
   */
  private async processAvatarUpdate(updatedData: FormData): Promise<void> {
    const avatarFile = updatedData.get('avatar') as File;
    if (!avatarFile?.size) return;

    const result = await this.userService.updateAvatar(avatarFile);
    if (!result.success) throw new Error(result.error);
  }

  /**
   * Processes the profile data update if changes are detected.
   * Parses user data from FormData, compares with current user, and calls `userService` to update.
   * @param updatedData The FormData object potentially containing updated user data.
   * @param currentUser The current User object for comparison.
   * @returns A Promise that resolves when the profile update is complete.
   * @throws Error if the profile update fails.
   */
  private async processProfileUpdate(updatedData: FormData, currentUser: User): Promise<void> {
    if (!updatedData.get('data')) return;

    const data = updatedData.get('data') as Blob;
    const userData = JSON.parse(await data.text());
    const changes = this.getUserChanges(currentUser, userData);

    if (!changes || !Object.keys(changes).length) return;

    const result : any = await this.userService.updateProfile(changes);
    if (!result.success) throw new Error(result.error);
    
    this.user.set(result.data);
  }

  /**
   * Handles the results of multiple update operations (avatar and profile).
   * Sets success or error messages based on the outcomes and refreshes the user profile on success.
   * @param results An array of PromiseSettledResult objects from the update operations.
   */
  private handleUpdateResults(...results: PromiseSettledResult<void>[]): void {
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown error');

    if (errors.length) {
      this.errorMessage.set(`Update failed: ${errors.join(' | ')}`);
    } else {
      this.successMessage.set('Profile updated successfully');
      this.loadUserProfile(); // Refresh data
    }
  }

  /**
   * Handles errors that occur during the save operation.
   * Formats the error message using `handleHttpError` and sets the `errorMessage` signal.
   * @param error The error object caught during the save process.
   */
  private handleSaveError(error: unknown): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const formattedError = handleHttpError(
      errorObj instanceof HttpErrorResponse 
        ? errorObj 
        : new HttpErrorResponse({ error: errorObj })
    );
    
    this.errorMessage.set(formattedError.message);
  }

  /**
   * Clears success and error messages after a specified delay.
   * @param delay The time in milliseconds after which to clear the messages. Defaults to 5000ms.
   */
  private clearMessagesAfterDelay(delay = 5000): void {
    setTimeout(() => {
      this.errorMessage.set('');
      this.successMessage.set('');
    }, delay);
  }

  /**
   * Compares the original user data with updated user data and returns an object
   * containing only the fields that have changed.
   * @param originalUser The original User object.
   * @param updatedUser A partial User object with potentially updated fields.
   * @returns A Partial<User> object containing only the changed fields, or null if no changes.
   */
  private getUserChanges(originalUser: User, updatedUser: Partial<User>): Partial<User> | null {
    const changes: Partial<User> = {};
    let hasChanges = false;

    // Champs à comparer (ajustez selon votre interface User)
    const fieldsToCompare: (keyof User)[] = [
      'name', 'email',
      'role', 'password'
    ];

    fieldsToCompare.forEach(field => {
      if (updatedUser.hasOwnProperty(field)) {
        const originalValue = this.normalizeValue(originalUser[field]);
        const updatedValue = this.normalizeValue(updatedUser[field]);

        if (originalValue !== updatedValue) {
          changes[field] = updatedUser[field] as any;
          hasChanges = true;
          console.log(`🔄 Changement détecté - ${field}: "${originalValue}" → "${updatedValue}"`);
        }
      }
    });

    return hasChanges ? changes : null;
  }

  /**
   * Normalizes a value for comparison by converting it to a trimmed string.
   * Handles null, undefined, and non-string values.
   * @param value The value to normalize.
   * @returns The normalized string representation of the value.
   */
  private normalizeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value.trim();
    }

    return String(value);
  }

  /**
   * Handles the cancellation of an operation, typically from a dialog.
   * Logs a message to the console.
   */
  handleCancel() {
    console.log('❌ Annulation par l\'utilisateur');
  }
}