import { Component, effect, OnInit, signal, Signal } from '@angular/core';
import { User } from '../models/interfaces';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  public currentUser = signal<User | null>(null);
  public isSignIn: Signal<boolean> = signal<boolean>(false);
  constructor(private route: Router, private authService: AuthService) {
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

  isSeller():boolean {
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
