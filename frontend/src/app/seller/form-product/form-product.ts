import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product-service';
import { DataService } from '../../services/data-service';
import { Product, productImage } from '../../models/interfaces';
import { Subscription } from 'rxjs';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-form-product',
  imports: [ReactiveFormsModule, MatButtonToggleModule, MatIconModule],
  templateUrl: './form-product.html',
  styleUrl: './form-product.css'
})
export class FormProduct implements OnInit, OnDestroy {
  images: Array<{ preview: string, id: string }> = [];
  private imageFiles: File[] = [];
  private imageDelete: string[] = [];
  currentProduct: Product | null = null;
  private updateProductfield : Product | null = null; 
  productForm: FormGroup;
  media_management = signal<boolean>(true);
  field_management = signal<boolean>(false);
  action_button = signal<boolean>(false);

  // Souscription pour éviter les fuites mémoire
  private subscription!: Subscription;

  // Propriétés pour le carrousel
  currentIndex = 0;
  visibleSlides = 3;
  slideWidth = 216;
  currentTranslate = 0;

  constructor(private productService: ProductService, private dataSharedProduct: DataService, private router: Router) {
    // Initialisation du formulaire
    this.productForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      quantity: new FormControl('', [Validators.required, Validators.min(0)]),
    });
  }

  modify_Switch(event: MatButtonToggleChange) {
    if (event.value != "field") {
      this.media_management.set(true);
      this.field_management.set(false);
      return;
    }
    this.media_management.set(false);
    this.field_management.set(true);
  }
  ngOnInit(): void {
    // Gérer la souscription proprement
    console.log("init form")
    if (this.IsUpdate()) {
      this.action_button.set(true)
      this.subscription = this.dataSharedProduct.data$.subscribe((data) => {
        if (data != null) {
          this.currentProduct = data;
          this.populateForm(data);
        }
      });
      if (this.currentProduct == null) {
        this.router.navigate(['/'])
      }
    } else {
      this.media_management.set(true);
      this.field_management.set(true);
    }

  }

  IsUpdate(): boolean {
    return this.currentProduct?.id != "" && location.pathname == "/products/update";
  }

  ngOnDestroy(): void {
    // Éviter les fuites mémoire
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.currentProduct = null;
  }

  // Pré-remplir le formulaire avec les données du produit
  private populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      quantity: product.quantity || ''
    });


    // Si le produit a des images, les charger aussi
    if (product.imageUrls && product.imageUrls.length > 0) {
      this.loadExistingImages(product.imageUrls);
    }
  }

  // Charger les images existantes du produit
  private loadExistingImages(imageUrls: productImage[]): void {
    this.images = imageUrls.map((url, index) => ({
      preview: url.imagePath,
      id: url.id
    }));
  }

  onFileSelected(event: Event) {
    if (this.imageFiles.length + this.images.length >5) {
      alert("🚨Vous avez depassez le seuil d'image requis !!!🚨")
      return;
    }
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of input.files) {
        // Créer la preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images.push({
            preview: e.target?.result as string,
            id: this.images.length.toString(),
          });
        };
        // Ajouter le fichier à la liste
        this.imageFiles.push(file);
        // Lire le fichier pour la prévisualisation
        reader.readAsDataURL(file);
      }
    }
  }

  deleteImage(id: string) {
    const index = this.images.findIndex(img => img.id === id);
    const idnumber = parseInt(id);
    if (index !== -1) {
      this.images.splice(index, 1);
      if (this.imageFiles[idnumber] != undefined) {
        this.imageFiles.splice(index, 1);
      } else {
        this.imageDelete.push(id);
      }
      console.log('Image supprimée avec succès', this.images.length, this.imageFiles.length);

      // Ajuster la position du carrousel
      if (this.currentIndex > 0 && this.currentIndex >= this.images.length - this.visibleSlides) {
        this.currentIndex = Math.max(0, this.images.length - this.visibleSlides);
        this.updateTranslate();
      }
    }
  }

  async onSubmit() {
    // Validation du formulaire
    if (this.productForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    try {
      // Préparation des données
      const formData = await this.prepareFormData();

      // Exécution des actions en fonction du contexte
      await this.executeFormActions(formData);

      // Redirection après succès
      this.router.navigate(['/products/myproduct']);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      // Gestion d'erreur à adapter selon vos besoins
    }
  }

  private async prepareFormData(): Promise<FormData> {
    const formData = new FormData();
    const productData = {
      ...this.productForm.value,
      ...(this.currentProduct?.id && { id: this.currentProduct.id })
    };

    this.updateProductfield = productData;
    // Ajout des données JSON pour la création
    if (!this.IsUpdate()) {
      formData.append('data', new Blob([JSON.stringify(productData)], {
        type: 'application/json'
      }));
    }

    // Ajout des images
    if (!this.IsUpdate()) {
      this.imageFiles.forEach(file => {
        formData.append('files', file);
      });
    }


    return formData;
  }

  private async executeFormActions(formData: FormData): Promise<void> {
    // Gestion des actions de mise à jour
    if (this.IsUpdate() && this.updateProductfield != null) {
      if (this.field_management()) {
        console.log("id product",this.currentProduct!.id)
        this.productService.updateProduct(this.currentProduct!.id, this.updateProductfield);
      }

      if (this.media_management()) {
        if (this.imageFiles.length > 0) {
          await this.productService.addImageInProduct(this.currentProduct!.id, this.imageFiles);
        }

        // Suppression des images marquées pour suppression
        await this.deleteMarkedImages();
      }
    } else {
      // Création d'un nouveau produit
      this.productService.addProduct(formData);
    }
  }

  private async deleteMarkedImages(): Promise<void> {
    if (this.imageDelete.length === 0) return;

    const deleteRequests = this.imageDelete.map(imageId =>
      this.productService.deleteImageInProduct(imageId)
    );

    // Exécution en parallèle avec un délai minimal entre chaque requête
    for (const request of deleteRequests) {
      await request;
      await new Promise(resolve => setTimeout(resolve, 100)); // Délai anti-spam
    }
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  private resetForm() {
    // Réinitialiser le formulaire
    this.productForm.reset();

    // Réinitialiser les images
    this.images = [];
    this.imageFiles = [];
    this.currentIndex = 0;
    this.currentTranslate = 0;
  }

  // Méthode utilitaire pour voir le contenu du FormData
  private logFormData(formData: FormData) {
    console.log('=== Contenu du FormData ===');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type
        });
      } else {
        console.log(`${key}:`, value);
      }
    }
  }

  // Méthodes du carrousel
  nextSlide() {
    if (this.canGoNext) {
      this.currentIndex++;
      this.updateTranslate();
    }
  }

  previousSlide() {
    if (this.canGoPrevious) {
      this.currentIndex--;
      this.updateTranslate();
    }
  }

  private updateTranslate() {
    this.currentTranslate = -this.currentIndex * this.slideWidth;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.images.length - this.visibleSlides && this.images.length > this.visibleSlides;
  }

  get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  get showNavigation(): boolean {
    return this.images.length > this.visibleSlides;
  }
}