import { Component, EventEmitter, Inject, Input, Output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-update-form',
  imports: [
    CommonModule,
    MatDialogActions,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIcon
  ],
  templateUrl: './update-form.html',
  styleUrl: './update-form.css'
})
export class UpdateForm {
  user = signal<any>(null);
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  authForm: FormGroup;
 
  constructor(
    public dialogRef: MatDialogRef<UpdateForm>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { user: User } // Injection des données
  ) {
    // Si des données utilisateur sont passées, les assigner au formulaire
     this.authForm = this.fb.group({
      avatar: [null],
      name: [data.user?.name || ''],
      email: [data.user?.email || ''],
      password: [data.user?.password || '']
    });
    this.user.set(data.user);
    // Prévisualisation de l'avatar
    if (data.user.avatar) {
      this.previewUrl = data.user.avatar;
    }

  }


  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onUpload(): void {
    this.dialogRef.close(this.selectedFile);
  }

  onSave(): void {
    if (this.authForm.invalid) {
      return;
    }

    const formData = new FormData();
   let userData = {
      name: this.authForm.get('name')?.value,
      email: this.authForm.get('email')?.value,
      role: this.authForm.get('role')?.value,
      password: this.authForm.get('password')?.value
    };
    formData.append('data', new Blob([JSON.stringify(userData)], { type: 'application/json' }));

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    // Ferme le dialogue et renvoie les données
    this.dialogRef.close(formData);
    // Supprimez this.onCancel() car dialogRef.close() suffit
  }

  onCancel(): void {
    // Ferme le dialogue sans renvoyer de données
    this.dialogRef.close();
    // Supprimez this.cancel.emit()
  }
}