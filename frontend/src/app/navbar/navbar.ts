import { Component, computed, effect, OnInit, signal, Signal } from '@angular/core';
import { User } from '../models/interfaces';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data-service';
import { ToastError } from "../error/toast-error/toast-error";

@Component({
  selector: 'app-navbar',
  imports: [ToastError],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  public currentUser = signal<User | null>(null);
  public isSignIn: Signal<boolean> = signal<boolean>(false);

  // Nouvelles propriétés pour la gestion d'état
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  messageStatus = computed(() => ({
    error: this.errorMessage(),
    success: this.successMessage()
  }));
  constructor(private route: Router, private authService: AuthService, private sharedData: DataService) {
    effect(() => {
      const user = this.authService.currentUser$();
      if (user) {
        this.currentUser.set(user);
      } else {
        this.currentUser.set(null);
      }
    });
  }
  async ngOnInit() {
    // Claim  the current user on authservice  signal
    await this.authService.checkAuth()
    this.sharedData.data$.subscribe((data: any) => {
      console.log('DEBUG - DataService data updated:', data);

      // Réinitialiser les messages
      this.errorMessage.set('');
      this.successMessage.set('');
      if (data.success) {
        this.successMessage.set(data.message ?? 'Operation successful');
      } else if (data.error) {
        this.errorMessage.set(data.error);
      }
    });
    this.isSignIn = this.authService.isSignIn$;
    this.currentUser.set(this.authService.currentUser$());

  }
  onSignIn() {
    this.route.navigate(['auth']);
  }

  myProfile() {
    console.log('Navigating to profile');
    // Navigate to the profile page
    this.route.navigate(['profil']);
  }

  isSeller(): boolean {
    const user = this.currentUser();
    return user?.role == 'SELLER'
  }

  onSignOut() {
    this.authService.signOut();
    this.route.navigate(['auth']);
  }
  navigateAndSetActive(route: string, event: Event) {
    event.preventDefault();

    // Supprimer la classe active de tous les liens
    document.querySelectorAll('.navbar-link').forEach(link => {
      link.classList.remove('active');
    });

    // Ajouter la classe active au lien cliqué
    (event.target as HTMLElement).classList.add('active');

    // Naviguer vers la route
    this.route.navigate([route]);
  }
}
