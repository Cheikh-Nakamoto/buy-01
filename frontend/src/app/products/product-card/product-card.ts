import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { CircularImage } from "../circular-image/circular-image";

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, CircularImage],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
@Input() product!: Product;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() addToCartEvent = new EventEmitter<Product>();
  imageurls: string[] = [];
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

  get badgeClass(): string {
    switch (this.badgeText) {
      case 'Nouveau': return 'badge-new';
      case 'Stock Limité': return 'badge-limited';
      case 'Promo': return 'badge-promo';
      case 'Premium': return 'badge-premium';
      default: return '';
    }
  }

  get stockStatusText(): string {
    if (this.product.quantity === 0) return 'Rupture de stock';
    if (this.product.quantity <= 5) return `Plus que ${this.product.quantity} en stock`;
    return 'En stock';
  }

  get stockStatusClass(): string {
    if (this.product.quantity === 0) return 'stock-out';
    if (this.product.quantity <= 5) return 'stock-low';
    return 'stock-ok';
  }

  get productPrice(): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(this.product.price);
  }

  get productImageUrls(): string[] {
    return this.product.imageUrls.map(image => image.imagePath);
  }

  viewProductDetails(productId: string) {
    this.viewDetails.emit(productId);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    this.addToCartEvent.emit(this.product);
  }
}
