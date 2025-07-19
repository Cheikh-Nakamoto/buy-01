import { CommonModule } from '@angular/common';
import { Component, TrackByFunction } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/interfaces';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList {
  trackByProductId: TrackByFunction<Product> = (index: number, product: Product) => product.id;
  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.applyFilters();
  }

  // Propriétés pour les données
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];

  // Propriétés pour les filtres et la recherche
  searchTerm: string = '';
  selectedCategory: string = 'all';
  viewMode: 'grid' | 'list' = 'grid';

  // Propriétés pour le tri
  sortBy: 'name' | 'price' | 'date' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  isLoading: boolean = false;

  ngOnInit() {
    this.loadProducts();
    this.extractCategories();
    this.applyFilters();
  }

  // Simulation de chargement des produits (à remplacer par votre service)
  loadProducts() {
    this.products = [
      {
        id: '1',
        name: 'Smartphone Pro Max',
        description: 'Le dernier smartphone avec une technologie révolutionnaire et des performances exceptionnelles pour tous vos besoins quotidiens.',
        price: 999,
        category: 'Électronique',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=250&fit=crop'],
        sellerId: 'seller1',
        sellerName: 'TechStore Pro',
        sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        name: 'Veste en Cuir Premium',
        description: 'Veste en cuir véritable, design moderne et confort optimal pour toutes les saisons. Finitions artisanales de haute qualité.',
        price: 249,
        category: 'Mode',
        stock: 12,
        images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop'],
        sellerId: 'seller2',
        sellerName: 'Fashion Elite',
        sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e9e3bc?w=50&h=50&fit=crop&crop=face',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: '3',
        name: 'Lampe Designer LED',
        description: 'Éclairage moderne avec contrôle intelligent et design minimaliste pour transformer votre intérieur.',
        price: 159,
        category: 'Maison',
        stock: 8,
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop'],
        sellerId: 'seller3',
        sellerName: 'Deco Moderne',
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '4',
        name: 'Baskets Running Pro',
        description: 'Chaussures de course haute performance avec technologie d\'amorti avancée pour vos entraînements intensifs.',
        price: 179,
        category: 'Sport',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'],
        sellerId: 'seller4',
        sellerName: 'SportMax',
        sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-22')
      },
      {
        id: '5',
        name: 'Casque Audio Sans Fil',
        description: 'Son haute fidélité avec réduction de bruit active et autonomie longue durée pour une expérience audio exceptionnelle.',
        price: 299,
        category: 'Électronique',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop'],
        sellerId: 'seller1',
        sellerName: 'TechStore Pro',
        sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-19')
      },
      {
        id: '6',
        name: 'Sac à Main Luxe',
        description: 'Sac en cuir italien, design élégant et finitions artisanales de haute qualité pour un style incomparable.',
        price: 399,
        category: 'Mode',
        stock: 5,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop'],
        sellerId: 'seller2',
        sellerName: 'Fashion Elite',
        sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e9e3bc?w=50&h=50&fit=crop&crop=face',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-17')
      }
    ];
  }

  // Extraire les catégories uniques
  extractCategories() {
    const uniqueCategories = [...new Set(this.products.map(product => product.category))];
    this.categories = ['all', ...uniqueCategories];
  }

  // Appliquer les filtres
  applyFilters() {
    let filtered = [...this.products];

    // Filtrage par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Filtrage par recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.sellerName.toLowerCase().includes(searchLower)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredProducts = filtered;
  }

  // Méthodes pour les filtres
  onSearchChange() {
    this.applyFilters();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onViewModeChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  onSortChange(sortBy: 'name' | 'price' | 'date') {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  // Méthodes utilitaires
  getProductBadge(product: Product): string {
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation <= 7) return 'Nouveau';
    if (product.stock <= 5) return 'Stock Limité';
    if (product.price < 200) return 'Promo';
    if (product.price > 300) return 'Premium';
    return '';
  }

  getBadgeClass(badge: string): string {
    switch (badge) {
      case 'Nouveau': return 'badge-new';
      case 'Stock Limité': return 'badge-limited';
      case 'Promo': return 'badge-promo';
      case 'Premium': return 'badge-premium';
      default: return '';
    }
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Rupture de stock';
    if (stock <= 5) return `Plus que ${stock} en stock`;
    return 'En stock';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-out';
    if (stock <= 5) return 'stock-low';
    return 'stock-ok';
  }

  // Actions sur les produits
  addToCart(product: Product) {
    console.log('Produit ajouté au panier:', product);
    // Ici vous pouvez appeler votre service de panier
    // this.cartService.addToCart(product);

    // Animation ou notification de succès
    this.showNotification(`${product.name} ajouté au panier !`);
  }

  viewProductDetails(productId: string) {
    console.log('Voir détails du produit:', productId);
    // Navigation vers la page de détails
    // this.router.navigate(['/products', productId]);
  }

  contactSeller(sellerId: string) {
    console.log('Contacter le vendeur:', sellerId);
    // Logique pour contacter le vendeur
  }

  private showNotification(message: string) {
    // Implémentation d'une notification toast
    console.log('Notification:', message);
  }

  // Getters pour les statistiques
  get totalProducts(): number {
    return this.products.length;
  }

  get totalCategories(): number {
    return this.categories.length - 1; // -1 pour exclure 'all'
  }

  get averagePrice(): number {
    if (this.products.length === 0) return 0;
    const total = this.products.reduce((sum, product) => sum + product.price, 0);
    return Math.round(total / this.products.length);
  }

  get filteredProductsCount(): number {
    return this.filteredProducts.length;
  }

  // Méthode pour formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Méthode pour formater la date
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  }
}
