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
/**
 * Component for creating and updating product information.
 * Handles form submission, image management, and interaction with the product service.
 */
export class FormProduct implements OnInit, OnDestroy {
  images: Array<{ preview: string, isNew: boolean, id: string }> = [];
  private imageFiles: File[] = [];
  private imageDelete: string[] = [];
  currentProduct: Product | null = null;
  private updateProductfield: Product | null = null;
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
  isLoading = signal<boolean>(false);
  // Nouvelles propriétés pour la gestion d'état
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  messageStatus = computed(() => ({
    error: this.errorMessage(),
    success: this.successMessage()
  }));

  private messageLoggerEffect = effect(() => {
    console.log('DEBUG - Nouveau statut des messages :', this.messageStatus());
  });


  constructor(private productService: ProductService, private dataSharedProduct: DataService, private router: Router) {

    // Initialisation du formulaire
    this.productForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      quantity: new FormControl('', [Validators.required, Validators.min(0)]),
    });
  }

  /**
   * Toggles between media management and field management sections of the form.
   * @param event The change event from the MatButtonToggle.
   */
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

  /**
   * Checks if the current operation is an update (i.e., if a product ID is present and the route is for updating).
   * @returns True if it's an update operation, false otherwise.
   */
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

  /**
   * Populates the product form with data from an existing product object.
   * Also loads existing images if available.
   * @param product The product object to use for populating the form.
   */
  private populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      quantity: product.quantity || ''
    });


    // Si le produit a des images, les charger aussi
    if (product.imageUrls && product.imageUrls.length > 0) {
      this.loadExistingImages(product.imageUrls, false);
    }
  }

  /**
   * Loads existing product images into the component's `images` array for display.
   * @param imageUrls An array of `productImage` objects containing image paths and IDs.
   */
  private loadExistingImages(imageUrls: productImage[], isNew?: boolean): void {
    this.images = imageUrls.map((url, index) => ({
      preview: url.imagePath,
      isNew: isNew != undefined ? isNew : true, // Indique si l'image est nouvelle ou existante
      id: url.id
    }));
  }

  /**
   * Handles the selection of new image files from the input.
   * Adds selected files to the `imageFiles` array and creates previews.
   * Enforces a maximum of 5 images.
   * @param event The DOM event triggered by the file input change.
   */
  onFileSelected(event: Event) {
    if (this.images.length > 5) {
      this.errorMessage.set("🚨Vous avez depassez le seuil d'image requis !!!🚨")
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
            isNew: true, // Indique que c'est une nouvelle image
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

  /**
   * Deletes an image from the preview list and marks it for deletion from the backend if it's an existing image.
   * Adjusts carousel position if necessary.
   * @param id The ID of the image to delete (can be a temporary ID for new images or a backend ID for existing ones).
   */
  deleteImage(id: string) {
    const index = this.images.findIndex(img => img.id === id);
    const idnumber = parseInt(id);
    if (index !== -1) {
      const elem: any = this.images.splice(index, 1);
      if (this.imageFiles[idnumber] != undefined) {
        this.imageFiles.splice(index, 1);
      } else if (elem[0].isNew === false) {
        this.imageDelete.push(id);
      }
      console.log('Image supprimée avec succès', elem);

      // Ajuster la position du carrousel
      if (this.currentIndex > 0 && this.currentIndex >= this.images.length - this.visibleSlides) {
        this.currentIndex = Math.max(0, this.images.length - this.visibleSlides);
        this.updateTranslate();
      }
    }
  }

  /**
   * Handles the form submission for both creating and updating products.
   * Validates the form, prepares data, executes API calls, and manages UI messages and navigation.
   */
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

  /**
   * Prepares the FormData object for product creation or update.
   * Includes product data and new image files.
   * @returns A Promise that resolves to the prepared FormData object.
   */
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

  /**
   * Executes the appropriate form actions (create or update product, add/delete images) based on the current context.
   * @param formData The FormData object containing product data and files.
   * @returns A Promise that resolves to an object indicating success, message, or error.
   */
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
        error: handleHttpError(error).message || 'An error occurred while processing your request.'
      };
    }
  }

  /**
   * Deletes images that have been marked for deletion from the backend.
   * Iterates through `imageDelete` array and calls the product service for each image.
   * @returns A Promise that resolves to an object indicating success or error.
   */
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
      if (error.status == 200) {
        return {
          success: true,
          error: handleHttpError(error).message || 'Image delete successfuly.'
        };
      }
      return {
        success: false,
        error: error?.message || 'Failed to delete images.'
      };
    }
  }


  /**
   * Marks all form fields as touched to trigger validation messages.
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Resets the product form and clears all image-related states.
   */
  private resetForm() {
    // Réinitialiser le formulaire
    this.productForm.reset();

    // Réinitialiser les images
    this.images = [];
    this.imageFiles = [];
    this.currentIndex = 0;
    this.currentTranslate = 0;
  }

  /**
   * Logs the content of a FormData object to the console for debugging purposes.
   * @param formData The FormData object to log.
   */
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

  /**
   * Clears success and error messages after a specified delay.
   * @param delay The time in milliseconds after which to clear the messages. Defaults to 5000ms.
   */
  private clearMessages(delay: number = 5000): void {
    setTimeout(() => {
      this.errorMessage.set('');
      this.successMessage.set('');
    }, delay);
  }


  /**
   * Moves the image carousel to the next slide if possible.
   */
  nextSlide() {
    if (this.canGoNext) {
      this.currentIndex++;
      this.updateTranslate();
    }
  }

  /**
   * Moves the image carousel to the previous slide if possible.
   */
  previousSlide() {
    if (this.canGoPrevious) {
      this.currentIndex--;
      this.updateTranslate();
    }
  }

  /**
   * Updates the CSS transform property to visually move the carousel slides.
   */
  private updateTranslate() {
    this.currentTranslate = -this.currentIndex * this.slideWidth;
  }

  /**
   * Determines if the carousel can move to the next slide.
   * @returns True if there are more slides to show, false otherwise.
   */
  get canGoNext(): boolean {
    return this.currentIndex < this.images.length - this.visibleSlides && this.images.length > this.visibleSlides;
  }

  /**
   * Determines if the carousel can move to the previous slide.
   * @returns True if there are previous slides, false otherwise.
   */
  get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Determines if carousel navigation buttons should be shown.
   * @returns True if the number of images exceeds the visible slides, false otherwise.
   */
  get showNavigation(): boolean {
    return this.images.length > this.visibleSlides;
  }
}