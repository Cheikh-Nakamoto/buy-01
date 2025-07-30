import { Component } from '@angular/core';
import { Form, FormControl, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product-service';

@Component({
  selector: 'app-form-product',
  imports: [ReactiveFormsModule],
  templateUrl: './form-product.html',
  styleUrl: './form-product.css'
})
export class FormProduct {
  images: Array<{ preview: string, id: number }> = [];
  imageFiles: File[] = [];
  productForm: FormGroup;

  // Propriétés pour le carrousel
  currentIndex = 0;
  visibleSlides = 3;
  slideWidth = 216;
  currentTranslate = 0;

  constructor(private productService: ProductService) {
    // Initialisation du formulaire
    this.productForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      //category: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [Validators.required, Validators.min(0)]),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of input.files) {


        // Créer la preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images.push({
            preview: e.target?.result as string,
            id: this.images.length
          });
        };
        // Ajouter le fichier à la liste
        this.imageFiles.push(file);
        // Lire le fichier pour la prévisualisation
        reader.readAsDataURL(file);
      }
    }
  }

  deleteImage(id: number) {
    const index = this.images.findIndex(img => img.id === id);
    if (index !== -1) {
      this.images.splice(index, 1);
      this.imageFiles.splice(index, 1);
      console.log('Image supprimée avec succès', this.images.length, this.imageFiles.length);

      // Ajuster la position du carrousel
      if (this.currentIndex > 0 && this.currentIndex >= this.images.length - this.visibleSlides) {
        this.currentIndex = Math.max(0, this.images.length - this.visibleSlides);
        this.updateTranslate();
      }
    }
  }

  onSubmit() {

    const formData = new FormData();
    // Ajouter les champs du formulaire;
    const data =  JSON.stringify(this.productForm.value);
    console.log('Données du formulaire:', data);
    const json = new Blob([data], { type: 'application/json' });
    formData.append('data', json);

    // Ajouter les fichiers images
    if (this.imageFiles.length !== 0) {
      console.log('Ajout de', this.imageFiles.length, 'images au FormData');
      this.imageFiles.forEach((file, index) => {
        formData.append(`files`, file);
        console.log(`Image ${index + 1} ajoutée:`, file.name);
      });
    }

    // Optionnel : Vérifier le contenu du FormData
    this.logFormData(formData);

    // Envoyer les données
    try {
      this.productService.addProduct(formData);
    } catch (error : any) {
      console.error('Erreur lors de l\'envoi du formulaire:', error.error);
      return;

    }
  }



  private resetForm() {
    // Réinitialiser le formulaire
    const form = document.querySelector('.product-form') as HTMLFormElement;
    form.reset();

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

  // Méthodes du carrousel (inchangées)
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
    console.log('Current Index:', this.currentIndex);
    return this.currentIndex > 0;
  }

  get showNavigation(): boolean {
    console.log('Images Length:', this.images.length, 'Visible Slides:', this.visibleSlides);
    return this.images.length > this.visibleSlides;
  }
}