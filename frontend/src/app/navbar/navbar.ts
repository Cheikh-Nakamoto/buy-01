import { Component } from '@angular/core';
import { User } from '../models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private user: User = {
    id: '',
    email: '',
    name: '',
    role: 'buyer', // Default role, adjust if needed
    createdAt: new Date()
  };

  constructor(private route: Router) { }
  onSignIn() {

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
