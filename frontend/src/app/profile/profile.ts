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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  providers: [HttpClient],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
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
        alert('Failed to load user profile: ' + error.message);
      }
    });
    console.log('Profile component initialized');
  }

  getBackgroundImage(): string {
    if (this.user()?.avatar) {
      return `url(${this.user()!.avatar})`;
    }
    return ''; // Utilisera le gradient CSS par défaut
  }

  /**
   * Génère les initiales à partir du nom complet
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
   * Retourne le libellé du rôle en français
   */
  getRoleLabel(role: 'CLIENT' | 'SELLER'): string {
    return role === 'CLIENT' ? 'Acheteur' : 'Vendeur';
  }

  /**
   * Formate la date de création du compte
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
   * Calcule l'ancienneté du compte
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
   * Modifier le profil
   */
  onEditProfile(): void {
    console.log('Édition du profil');
    // Implémenter la navigation vers la page d'édition
    // this.router.navigate(['/profile/edit']);
  }

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

      this.handleUpdateResults(avatarResult, profileResult);
    } catch (error) {
      this.handleSaveError(error);
    } finally {
      this.isLoading.set(false);
      this.clearMessagesAfterDelay();
    }
  }

  private async processAvatarUpdate(updatedData: FormData): Promise<void> {
    const avatarFile = updatedData.get('avatar') as File;
    if (!avatarFile?.size) return;

    const result = await this.userService.updateAvatar(avatarFile);
    if (!result.success) throw new Error(result.error);
  }

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

  private handleSaveError(error: unknown): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const formattedError = handleHttpError(
      errorObj instanceof HttpErrorResponse 
        ? errorObj 
        : new HttpErrorResponse({ error: errorObj })
    );
    
    this.errorMessage.set(formattedError.message);
  }

  private clearMessagesAfterDelay(delay = 5000): void {
    setTimeout(() => {
      this.errorMessage.set('');
      this.successMessage.set('');
    }, delay);
  }

  /**
   * Compare les données utilisateur et retourne les changements
   */
  private getUserChanges(originalUser: User, updatedUser: Partial<User>): Partial<User> | null {
    const changes: Partial<User> = {};
    let hasChanges = false;

    // Champs à comparer (ajustez selon votre interface User)
    const fieldsToCompare: (keyof User)[] = [
      'name', 'email',
      'role'
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
   * Normalise une valeur pour la comparaison
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

  // /**
  //  * Met à jour l'avatar
  //  */
  // private async updateAvatar(file: File): Promise<void> {
  //   console.log('🖼️ Mise à jour de l\'avatar...');
  //   try {
  //     await this.userService.updateAvatar(file)
  //   } catch (error: any) {
  //     console.error('❌ Erreur avatar:', error);
  //     handleHttpError(error)
  //   }
  // }

  // /**
  //  * Met à jour le profil utilisateur
  //  */
  // private async updateProfile(changes: Partial<User>): void {
  //   console.log('📝 Mise à jour du profil avec les changements:', changes);
  //   try {
  //     let response = await this.userService.updateProfile(changes)
  //     this.user.set(response);
  //     console.log('✅ Profil mis à jour avec succès', response);
  //     // Message de succès avec détails
  //     const updatedFields = Object.keys(changes).join(', ');
  //   } catch (error) {
  //     console.error('❌ Erreur profil:', error);

  //   }

  // }

  handleCancel() {
    console.log('❌ Annulation par l\'utilisateur');
  }
}