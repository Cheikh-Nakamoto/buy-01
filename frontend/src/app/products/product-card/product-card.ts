import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { CircularImage } from "../circular-image/circular-image";
import { DataService } from '../../services/data-service';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, CircularImage, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
/**
 * Component for displaying a single product as a card.
 * Handles displaying product details, badges, stock status, and user interactions like
 * viewing details, adding to cart, and deleting images (for seller's own products).
 */
export class ProductCard {
  /** The product data to be displayed in the card. */
  @Input() product!: Product;
  /** Emits the product ID when the "view details" action is triggered. */
  @Output() viewDetails = new EventEmitter<string>();
  /** Emits the product object when the "add to cart" action is triggered. */
  @Output() addToCartEvent = new EventEmitter<Product>();
  /** Emits the product ID when an image deletion is requested. */
  @Output() productIdEvent = new EventEmitter<string>();
  imageurls: string[] = [];

  constructor(private datasharedService: DataService, private router: Router) { }

  /**
   * Emits the product ID to signal a request to delete an image associated with the product.
   * @param id The ID of the image to be deleted.
   */
  deleteImage(id: string) {
    console.log("emission du product id ",id)
    this.productIdEvent.emit(this.product.id);
  }

  /**
   * Computes a badge text based on product properties like creation date, quantity, and price.
   * @returns A string representing the badge (e.g., 'Nouveau', 'Stock Limité', 'Promo', 'Premium').
   */
  get badgeText(): string {
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(this.product.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation <= 7) return 'Nouveau';
    if (this.product.quantity <= 5) return 'Stock Limité';
    if (this.product.price < 200) return 'Promo';
    if (this.product.price > 300) return 'Premium';
    return '';
  }

  /**
   * Computes the CSS class for the product badge based on its text.
   * @returns A string representing the CSS class.
   */
  get badgeClass(): string {
    switch (this.badgeText) {
      case 'Nouveau': return 'badge-new';
      case 'Stock Limité': return 'badge-limited';
      case 'Promo': return 'badge-promo';
      case 'Premium': return 'badge-premium';
      default: return '';
    }
  }

  /**
   * Computes a human-readable stock status message based on the product's quantity.
   * @returns A string indicating the stock status (e.g., 'Rupture de stock', 'Plus que X en stock', 'En stock').
   */
  get stockStatusText(): string {
    if (this.product.quantity === 0) return 'Rupture de stock';
    if (this.product.quantity <= 5) return `Plus que ${this.product.quantity} en stock`;
    return 'En stock';
  }

  /**
   * Computes the CSS class for the stock status based on the product's quantity.
   * @returns A string representing the CSS class.
   */
  get stockStatusClass(): string {
    if (this.product.quantity === 0) return 'stock-out';
    if (this.product.quantity <= 5) return 'stock-low';
    return 'stock-ok';
  }

  /**
   * Formats the product's price into a currency string (EUR, French locale).
   * @returns The formatted price string.
   */
  get productPrice(): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(this.product.price);
  }

  /**
   * Extracts an array of image URLs from the product's image objects.
   * @returns An array of strings, each representing an image URL.
   */
  get productImageUrls(): string[] {
    return this.product.imageUrls.map(image => image.imagePath);
  }

  /**
   * Emits the product ID to indicate that the user wants to view product details.
   * @param productId The ID of the product whose details are to be viewed.
   */
  viewProductDetails(productId: string) {
    this.viewDetails.emit(productId);
  }

  /**
   * Emits the product object to indicate that the user wants to add it to the cart.
   * Prevents event propagation to avoid triggering other click handlers.
   * @param event The DOM event.
   */
  addToCart(event: Event) {
    event.stopPropagation();
    this.addToCartEvent.emit(this.product);
  }
  /**
   * Determines if certain elements (e.g., update/delete buttons) should be hidden based on the current route.
   * @returns True if the current path is '/products/myproduct', false otherwise.
   */
  canHide(): boolean {
    return location.pathname === "/products/myproduct";
  }

  /**
   * Navigates to the product update page, passing the current product data.
   * Prevents event propagation to avoid triggering other click handlers.
   * @param event The DOM event.
   */
  async goToUpdateProduct(event: Event) {
    event.stopPropagation();
    this.datasharedService.updateData(this.product);
    // Correction de la navigation
    await this.router.navigate(["/products/update"]);
  }

}
