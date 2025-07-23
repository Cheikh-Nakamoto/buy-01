import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-update-form',
  imports: [MatDialogActions, MatDialogModule],
  templateUrl: './update-form.html',
  styleUrl: './update-form.css'
})
export class UpdateForm {
 selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<UpdateForm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onUpload(): void {
    this.dialogRef.close(this.selectedFile); // Renvoie le fichier au parent
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
