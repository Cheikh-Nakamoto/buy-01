import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product-service';
import { DataService } from '../../services/data-service';
import { Product, productImage } from '../../models/interfaces';
import { Subscription } from 'rxjs';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { ToastError } from "../../error/toast-error/toast-error";
import { handleHttpError } from '../../utils/utils';

@Component({
  selector: 'app-form-product',
  imports: [ReactiveFormsModule, MatButtonToggleModule, MatIconModule, ToastError],
  templateUrl: './form-product.html',
  styleUrl: './form-product.css'
})
export class FormProduct implements OnInit, OnDestroy {
  images: Array<{ preview: string, id: string }> = [];
  private imageFiles: File[] = [];
  private imageDelete: string[] = [];
  currentProduct: Product | null = null;
  private updateProductfield: Product | null = null;
  productForm: FormGroup;
  media_management = signal<boolean>(true);
  field_management = signal<boolean>(false);
  action_button = signal<boolean>(false);

  // Nouvelles propriétés pour la gestion d'état
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');


  // Souscription pour éviter les fuites mémoire
  private subscription!: Subscription;

  // Propriétés pour le carrousel
  currentIndex = 0;
  visibleSlides = 3;
  slideWidth = 216;
  currentTranslate = 0;
  messageStatus = computed(() => ({
    error: this.errorMessage(),
    success: this.successMessage()
  }));

  private messageLoggerEffect = effect(() => {
     console.log('DEBUG - Nouveau statut des messages :', this.messageStatus());
    // Ici, vous pourriez intégrer une logique de logging externe,
    // ou envoyer ces messages à un service de toasts/notifications
  });


  constructor(private productService: ProductService, private dataSharedProduct: DataService, private router: Router) {
    // Un computed qui génère un objet avec le contenu des messages

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
    if (this.imageFiles.length + this.images.length > 5) {
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
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      // Préparation des données
      const formData = await this.prepareFormData();

      // Exécution des actions en fonction du contexte
      const result: any = await this.executeFormActions(formData);

      if (result.success) {
        this.successMessage.set(result.message || 'Operation completed successfully!');

        // Petit délai pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          this.router.navigate(['/products/myproduct']);
        }, 1500);
      } else {
        this.errorMessage.set(result.error || 'Operation failed. Please try again.');
      }

    } catch (error: any) {
      // Gestion spécifique des erreurs
     this.errorMessage.set(handleHttpError(error).message)
    } finally {
      this.isLoading.set(false);
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

  private async executeFormActions(formData: FormData): Promise<{ success: boolean, message?: string, error?: string }> {
    try {
      // Gestion des actions de mise à jour
      if (this.IsUpdate() && this.updateProductfield != null) {

        if (this.field_management()) {
          console.log("id product", this.currentProduct!.id);
          const updateResult: any = await this.productService.updateProduct(
            this.currentProduct!.id,
            this.updateProductfield
          );

          if (!updateResult.success) {
            return { success: false, error: updateResult.error || 'Failed to update product information.' };
          }
        }

        if (this.media_management()) {
          // Ajout d'images
          if (this.imageFiles.length > 0) {
            const addImagesResult: any = await this.productService.addImageInProduct(
              this.currentProduct!.id,
              this.imageFiles
            );

            if (!addImagesResult.success) {
              return { success: false, error: addImagesResult.error || 'Failed to add images.' };
            }
          }

          // Suppression des images marquées pour suppression
          const deleteResult: any = await this.deleteMarkedImages();
          if (!deleteResult.success) {
            return { success: false, error: deleteResult.error || 'Failed to delete some images.' };
          }
        }

        return { success: true, message: 'Product updated successfully!' };

      } else {
        // Création d'un nouveau produit
        const createResult: any = await this.productService.addProduct(formData);

        if (!createResult.success) {
          return { success: false, error: createResult.error || 'Failed to create product.' };
        }

        return { success: true, message: 'Product created successfully!' };
      }

    } catch (error: any) {
      console.error('Error in executeFormActions:', error);
      return {
        success: false,
        error:  handleHttpError(error).message || 'An error occurred while processing your request.'
      };
    }
  }

  private async deleteMarkedImages(): Promise<{ success: boolean, error?: string }> {
    if (this.imageDelete.length === 0) {
      return { success: true };
    }

    try {
      const deleteResults = [];

      // Exécution séquentielle avec gestion d'erreur pour chaque image
      for (const imageId of this.imageDelete) {
        try {
          const result = await this.productService.deleteImageInProduct(imageId);
          deleteResults.push(result);

          // Délai anti-spam
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to delete image ${imageId}:`, error);
          deleteResults.push({ success: false, error: `Failed to delete image ${imageId}` });
        }
      }

      // Vérifier si toutes les suppressions ont réussi
      const failedDeletes = deleteResults.filter((result: any) => !result.success);

      if (failedDeletes.length > 0) {
        return {
          success: false,
          error: `Failed to delete ${failedDeletes.length} image(s). Some images may still be present.`
        };
      }

      return { success: true };

    } catch (error: any) {
      console.error('Error in deleteMarkedImages:', error);
      if (error.status == 200){
         return {
        success: true,
        error: handleHttpError(error).message || 'Failed to delete images.'
      };
      }
      return {
        success: false,
        error: error?.message || 'Failed to delete images.'
      };
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

  // Méthode pour nettoyer les messages après un certain temps
  private clearMessages(delay: number = 5000): void {
    setTimeout(() => {
      this.errorMessage.set('');
      this.successMessage.set('');
    }, delay);
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