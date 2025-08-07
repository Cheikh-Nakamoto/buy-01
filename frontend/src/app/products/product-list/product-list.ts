import { CommonModule } from '@angular/common';
import { Component, Signal, TrackByFunction } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/interfaces';
import { ProductService } from '../../services/product-service';
import { ProductCard } from "../product-card/product-card";
import { OnInit, signal } from '@angular/core';
import { computed } from '@angular/core';
import { effect } from '@angular/core';
import { handleHttpError, reverseListDoubleLoop } from '../../utils/utils';
import { ToastError } from "../../error/toast-error/toast-error";

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, ProductCard, ToastError],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
/**
 * Component for displaying a list of products.
 * Handles product filtering, sorting, and interaction with the product service.
 */
export class ProductList implements OnInit {

  /**
   * TrackBy function for optimizing Angular's change detection when rendering product lists.
   * @param index The index of the item in the array.
   * @param product The current product object.
   * @returns The unique ID of the product.
   */
  trackByProductId: TrackByFunction<Product> = (index: number, product: Product) => product.id;

  // Nouvelles propriétés pour la gestion d'état
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  /**
   * Resets all filters (search term, category, sort by, sort order) to their default values
   * and re-applies the filters to the product list.
   */
  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.applyFilters();
  }

  // Propriétés pour les données
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  categories: string[] = [];

  // Propriétés pour les filtres et la recherche
  searchTerm: string = '';
  selectedCategory: string = 'all';
  viewMode: 'grid' | 'list' = 'grid';

  // Propriétés pour le tri
  sortBy: 'name' | 'price' | 'date' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  isLoading: boolean = false;
  messageStatus = computed(() => ({
    error: this.errorMessage(),
    success: this.successMessage()
  }));

  private messageLoggerEffect = effect(() => {
    console.log('DEBUG - Nouveau statut des messages :', this.messageStatus());
    let elem = this.products();
    console.log('Products loaded:', this.products(), reverseListDoubleLoop(elem));

    // Ici, vous pourriez intégrer une logique de logging externe,
    // ou envoyer ces messages à un service de toasts/notifications
  });
  constructor(private productService: ProductService) { }

  async ngOnInit() {
    //this.loadProducts();

    // this.extractCategories();
    // this.applyFilters();
    console.log('ProductList component initialized');
    if (location.pathname != "/products/myproduct") {
      this.productService.getProducts().subscribe({
        next: (products) => {
          this.products.set(reverseListDoubleLoop(products));
          this.filteredProducts.set(reverseListDoubleLoop(products)); // Initialiser les produits filtrés
          this.extractCategories(); // Extraire les catégories après chargement des produits
        },
        error: (error: any) => {
          this.errorMessage.set(error.message)
        }
      });
    } else {
      this.productService.getMyProduct().subscribe({
        next: (products) => {
          if (products) {
            this.products.set(reverseListDoubleLoop(products));
            this.filteredProducts.set(reverseListDoubleLoop(products)); // Initialiser les produits filtrés
            this.extractCategories(); // Extraire les catégories après chargement des produits
          }
        },
        error: (error: any) => {
          this.errorMessage.set(error.message)
        }
      });
    }
  }

  /**
   * Deletes a product by its ID.
   * @param $event The ID of the product to be deleted.
   */
  async deleteProduct($event: string) {
    try {
      console.log("arrivage du event ", $event);
      let respons: any = await this.productService.deleteProduct($event);
      if (respons.success) {
        console.log("Product deleted successfully:", respons);
        this.successMessage.set(respons.message)
        this.filteredProducts.set([]);
        // Délai anti-spam
        await new Promise(resolve => setTimeout(resolve, 100));
        this.productService.getMyProduct().subscribe({
          next: (products) => {
            if (products) {
              this.products.set(reverseListDoubleLoop(products));
              this.filteredProducts.set(reverseListDoubleLoop(products)); // Initialiser les produits filtrés
              this.extractCategories(); // Extraire les catégories après chargement des produits
            }
          },
          error: (error: any) => {
            this.errorMessage.set(error.message)
          }
        });
      }
    } catch (error: any) {
      this.errorMessage.set(error.message)
    }
  }

  /**
   * Determines if certain elements should be hidden based on the current route.
   * @returns True if the current path is '/products/myproduct', false otherwise.
   */
  canHide(): boolean {
    return location.pathname === "/products/myproduct";
  }

  // Simulation de chargement des produits (à remplacer par votre service)
  loadProducts() {
    // this.products = [
    //   {
    //     id: '1',
    //     name: 'Smartphone Pro Max',
    //     description: 'Le dernier smartphone avec une technologie révolutionnaire et des performances exceptionnelles pour tous vos besoins quotidiens.',
    //     price: 999,
    //     category: 'Électronique',
    //     quantity: 25,
    //     images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=250&fit=crop'],
    //     sellerName: 'TechStore Pro',
    //     sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
    //     createdAt: new Date('2024-01-15'),
    //     updatedAt: new Date('2024-01-20')
    //   },
    //   {
    //     id: '2',
    //     name: 'Veste en Cuir Premium',
    //     description: 'Veste en cuir véritable, design moderne et confort optimal pour toutes les saisons. Finitions artisanales de haute qualité.',
    //     price: 249,
    //     category: 'Mode',
    //     quantity: 12,
    //     images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop'],
    //     sellerName: 'Fashion Elite',
    //     sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e9e3bc?w=50&h=50&fit=crop&crop=face',
    //     createdAt: new Date('2024-01-10'),
    //     updatedAt: new Date('2024-01-18')
    //   },
    //   {
    //     id: '3',
    //     name: 'Lampe Designer LED',
    //     description: 'Éclairage moderne avec contrôle intelligent et design minimaliste pour transformer votre intérieur.',
    //     price: 159,
    //     category: 'Maison',
    //     quantity: 8,
    //     images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop'],
    //     sellerName: 'Deco Moderne',
    //     sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    //     createdAt: new Date('2024-01-05'),
    //     updatedAt: new Date('2024-01-15')
    //   },
    //   {
    //     id: '4',
    //     name: 'Baskets Running Pro',
    //     description: 'Chaussures de course haute performance avec technologie d\'amorti avancée pour vos entraînements intensifs.',
    //     price: 179,
    //     category: 'Sport',
    //     quantity: 30,
    //     images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'],
    //     sellerName: 'SportMax',
    //     sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    //     createdAt: new Date('2024-01-12'),
    //     updatedAt: new Date('2024-01-22')
    //   },
    //   {
    //     id: '5',
    //     name: 'Casque Audio Sans Fil',
    //     description: 'Son haute fidélité avec réduction de bruit active et autonomie longue durée pour une expérience audio exceptionnelle.',
    //     price: 299,
    //     category: 'Électronique',
    //     quantity: 15,
    //     images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop'],
    //     sellerName: 'TechStore Pro',
    //     sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
    //     createdAt: new Date('2024-01-08'),
    //     updatedAt: new Date('2024-01-19')
    //   },
    //   {
    //     id: '6',
    //     name: 'Sac à Main Luxe',
    //     description: 'Sac en cuir italien, design élégant et finitions artisanales de haute qualité pour un style incomparable.',
    //     price: 399,
    //     category: 'Mode',
    //     quantity: 5,
    //     images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop'],
    //     sellerName: 'Fashion Elite',
    //     sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e9e3bc?w=50&h=50&fit=crop&crop=face',
    //     createdAt: new Date('2024-01-03'),
    //     updatedAt: new Date('2024-01-17')
    //   }
    // ];
  }




  /**
   * Extracts unique categories from the current list of products and updates the categories array.
   * Adds an 'all' option for filtering.
   */
  extractCategories() {
    const uniqueCategories = [...new Set(this.products().map(product => product.category != undefined ? product.category : 'Autre'))];;
    this.categories = ['all', ...uniqueCategories];
  }

  /**
   * Applies filters (category, search term) and sorting to the product list.
   * Updates the `filteredProducts` signal with the results.
   */
  applyFilters() {
    let filtered = [...this.products()]; // Créer une copie inversée des produits


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
        product.category?.toLowerCase().includes(searchLower) ||
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
          comparison = new Date(b.createdAt ? b.createdAt : 0).getTime() - new Date(a.createdAt ? a.createdAt : 0).getTime();
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredProducts.set(filtered);
  }

  // Méthodes pour les filtres
  /**
   * Handles changes in the search term input.
   * Triggers the application of filters.
   */
  onSearchChange() {
    this.applyFilters();
  }

  /**
   * Handles changes in the selected category.
   * Updates the `selectedCategory` and triggers the application of filters.
   * @param category The selected category string.
   */
  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  /**
   * Changes the display mode of the product list (grid or list).
   * @param mode The desired view mode ('grid' or 'list').
   */
  onViewModeChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  /**
   * Handles changes in the sorting criteria.
   * Toggles sort order if the same criteria is selected again, otherwise sets to ascending.
   * Triggers the application of filters.
   * @param sortBy The criteria to sort by ('name', 'price', or 'date').
   */
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
      (new Date().getTime() - new Date(product.createdAt ? product.createdAt : 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation <= 7) return 'Nouveau';
    if (product.quantity ? product.quantity <= 5 : false) return 'Stock Limité';
    if (product.price < 200) return 'Promo';
    if (product.price > 300) return 'Premium';
    return '';
  }

  /**
   * Returns the CSS class name corresponding to a given product badge.
   * @param badge The badge string (e.g., 'Nouveau', 'Stock Limité').
   * @returns The CSS class name for styling the badge.
   */
  getBadgeClass(badge: string): string {
    switch (badge) {
      case 'Nouveau': return 'badge-new';
      case 'Stock Limité': return 'badge-limited';
      case 'Promo': return 'badge-promo';
      case 'Premium': return 'badge-premium';
      default: return '';
    }
  }

  /**
   * Returns a string indicating the stock status of a product based on its quantity.
   * @param quantity The quantity of the product in stock.
   * @returns A string describing the stock status.
   */
  getStockStatus(quantity: number): string {
    if (quantity === 0) return 'Rupture de quantity';
    if (quantity <= 5) return `Plus que ${quantity} en quantity`;
    return 'En quantity';
  }

  /**
   * Returns the CSS class name for styling the stock status based on quantity.
   * @param quantity The quantity of the product in stock.
   * @returns The CSS class name for stock status.
   */
  getStockClass(quantity: number): string {
    if (quantity === 0) return 'quantity-out';
    if (quantity <= 5) return 'quantity-low';
    return 'quantity-ok';
  }


  /**
   * Initiates the process to contact a seller.
   * @param sellerId The ID of the seller to contact.
   */
  contactSeller(sellerId: string) {
    console.log('Contacter le vendeur:', sellerId);
    // Logique pour contacter le vendeur
  }

  /**
   * Displays a notification message (e.g., a toast).
   * @param message The message to display.
   */
  private showNotification(message: string) {
    // Implémentation d'une notification toast
    console.log('Notification:', message);
  }

  /**
   * Gets the total number of products currently loaded.
   * @returns The total count of products.
   */
  get totalProducts(): number {
    return this.products().length;
  }

  /**
   * Gets the total number of unique categories (excluding 'all').
   * @returns The count of unique categories.
   */
  get totalCategories(): number {
    return this.categories.length - 1; // -1 pour exclure 'all'
  }

  /**
   * Calculates the average price of all loaded products.
   * @returns The average price, rounded to the nearest integer. Returns 0 if no products.
   */
  get averagePrice(): number {
    if (this.products().length === 0) return 0;
    const total = this.products().reduce((sum, product) => sum + product.price, 0);
    return Math.round(total / this.products.length);
  }

  /**
   * Gets the number of products currently displayed after filtering.
   * @returns The count of filtered products.
   */
  get filteredProductsCount(): number {
    return this.filteredProducts.length;
  }

  /**
   * Formats a numeric price into a currency string (EUR, French locale).
   * @param price The price to format.
   * @returns The formatted price string.
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  /**
   * Formats a Date object into a localized date string (French locale).
   * @param date The Date object to format.
   * @returns The formatted date string.
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  }
}
