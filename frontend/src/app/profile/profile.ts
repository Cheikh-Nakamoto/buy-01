import { Component, signal, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../models/interfaces';
import { UserService } from '../services/user-service';
import { UpdateForm } from './update-form/update-form';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

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

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      if (result) {
        this.handleSave(result);
      }
    });
  }

  /**
   * Gère la sauvegarde avec vérification des changements
   */
  async handleSave(updatedData: FormData) {
    console.log('🔄 Données reçues:', updatedData);
    
    const currentUser = this.user();
    if (!currentUser) {
      console.error('❌ Utilisateur actuel non disponible');
      alert('Erreur: utilisateur non chargé');
      return;
    }

    let hasAvatarUpdate = false;
    let hasProfileUpdate = false;

    // === GESTION AVATAR ===
    const avatarFile = updatedData.get('avatar') as File;
    if (avatarFile && avatarFile.size > 0) {
      console.log('🖼️ Nouveau fichier avatar détecté:', avatarFile.name);
      hasAvatarUpdate = true;
      this.updateAvatar(avatarFile);
    }

    // === GESTION PROFIL ===
    if (updatedData.get('data')) {
      const data = updatedData.get('data') as Blob;
      
      try {
        const userData = JSON.parse(await data.text());
        console.log('📝 Données reçues du formulaire:', userData);
        
        // Vérifier les changements
        const changes = this.getUserChanges(currentUser, userData);
        
        if (changes && Object.keys(changes).length > 0) {
          console.log('🔄 Changements détectés:', changes);
          console.log(`📊 ${Object.keys(changes).length} champ(s) modifié(s):`, Object.keys(changes));
          hasProfileUpdate = true;
          this.updateProfile(changes);
        } else {
          console.log('👍 Aucun changement dans le profil - Mise à jour évitée');
        }
        
      } catch (error) {
        console.error('❌ Erreur parsing JSON:', error);
        alert('Erreur lors du traitement des données : ' + error);
        return;
      }
    }

    // Message si aucune mise à jour nécessaire
    if (!hasAvatarUpdate && !hasProfileUpdate) {
      console.log('✅ Aucune modification détectée - Aucune requête envoyée');
      alert('Aucune modification à sauvegarder');
    }
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

  /**
   * Met à jour l'avatar
   */
  private updateAvatar(file: File): void {
    console.log('🖼️ Mise à jour de l\'avatar...');
    
    this.userService.updateAvatar(file).subscribe({
      next: () => {
        console.log('✅ Avatar mis à jour avec succès');
        // Recharger le profil pour obtenir la nouvelle URL d'avatar
        this.loadUserProfile();
        alert('Avatar mis à jour avec succès!');
      },
      error: (error) => {
        console.error('❌ Erreur avatar:', error);
        alert('Erreur lors de la mise à jour de l\'avatar : ' + error.message);
      }
    });
  }

  /**
   * Met à jour le profil utilisateur
   */
  private updateProfile(changes: Partial<User>): void {
    console.log('📝 Mise à jour du profil avec les changements:', changes);
    
    this.userService.updateProfile(changes).subscribe({
      next: (response) => {
        this.user.set(response);
        console.log('✅ Profil mis à jour avec succès', response);
        
        // Message de succès avec détails
        const updatedFields = Object.keys(changes).join(', ');
        alert(`Profil mis à jour avec succès!\nChamps modifiés: ${updatedFields}`);
      },
      error: (error) => {
        console.error('❌ Erreur profil:', error);
        alert('Échec de la mise à jour du profil : ' + error.message);
      }
    });
  }

  handleCancel() {
    console.log('❌ Annulation par l\'utilisateur');
  }
}