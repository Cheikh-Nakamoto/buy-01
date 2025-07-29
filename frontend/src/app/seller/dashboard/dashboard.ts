import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(private router: Router) {}


  onNewProductClick(): void {
    console.log('Navigating to new product form');
    this.router.navigate(['/products/new']);
  }
}
