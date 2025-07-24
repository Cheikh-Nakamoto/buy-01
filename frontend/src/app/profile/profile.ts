import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../models/interfaces';
import { UserService } from '../services/user-service';
import { UpdateForm } from './update-form/update-form';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  user = signal<User | null>(null);

  constructor(private userService: UserService, private dialog: MatDialog) { }

  async ngOnInit() {
    this.user.set(await this.userService.getProfile());
    console.log('Profile component initialized');
    console.log('Current user:', this.user());
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
  getRoleLabel(role: 'client' | 'seller'): string {
    return role === 'client' ? 'Acheteur' : 'Vendeur';
  }
  /**
   * Formate la date de création du compte
   */
  getFormattedDate(date: Date | string | null | undefined): string {
    // Vérification que la date existe et est valide
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Date non disponible'; // ou retourner une valeur par défaut
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
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((file: File) => {
      if (file) {
        // Envoyez le fichier au serveur ici
        console.log('Fichier sélectionné:', file);
      }
    });
  }



  // /**
  //  * Voir les commandes (pour les acheteurs)
  //  */
  // onViewOrders(): void {
  //   console.log('Voir les commandes');
  //   // Implémenter la navigation vers les commandes de l'acheteur
  //   // this.router.navigate(['/buyer/orders']);
  // }


}