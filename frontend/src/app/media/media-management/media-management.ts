import { Component, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MediaItem } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-media-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-management.html',
  styleUrl: './media-management.css'
})
export class MediaManagement {
  userAvatar = 'https://example.com/images/product1.jpg';
  userName = 'Seller Name';
  
  isDragging = false;
  uploadProgress = 0;
  uploadError: string | null = null;
  currentFile: File | null = null;
  
  mediaItems: MediaItem[] = [];
  filteredMedia: MediaItem[] = [];
  filterType: 'all' | 'image' | 'video' = 'all';
  
  previewMedia: MediaItem | null = null;

  // constructor(
  //   private http: HttpClient,
  //   private sanitizer: DomSanitizer
  // ) {
  //   // Load sample data or fetch from API
  //   this.loadMediaItems();
  // }

  // loadMediaItems() {
  //   // In a real app, you would fetch this from your API
  //   this.mediaItems = [
  //     {
  //       id: '1',
  //       name: 'product-image-1.jpg',
  //       url: 'https://example.com/images/product1.jpg',
  //       type: 'image',
  //       size: 1024 * 1024 * 1.5, // 1.5MB
  //       uploadedAt: new Date()
  //     },
  //     {
  //       id: '2',
  //       name: 'product-video-1.mp4',
  //       url: 'https://example.com/videos/product1.mp4',
  //       type: 'video',
  //       size: 1024 * 1024 * 8, // 8MB
  //       uploadedAt: new Date()
  //     }
  //   ];
  //   this.filterMedia();
  // }

  // filterMedia() {
  //   if (this.filterType === 'all') {
  //     this.filteredMedia = [...this.mediaItems];
  //   } else {
  //     this.filteredMedia = this.mediaItems.filter(item => item.type === this.filterType);
  //   }
  // }

  // onDragOver(event: DragEvent) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.isDragging = true;
  // }

  // onDragLeave(event: DragEvent) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.isDragging = false;
  // }

  // onDrop(event: DragEvent) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.isDragging = false;
    
  //   if (event.dataTransfer?.files) {
  //     this.handleFiles(event.dataTransfer.files);
  //   }
  // }

  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.handleFiles(input.files);
  //   }
  // }

  // handleFiles(files: FileList) {
  //   this.uploadError = null;
    
  //   // Validate files
  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];
  //     const fileType = file.type.split('/')[0];
      
  //     if (fileType !== 'image' && fileType !== 'video') {
  //       this.uploadError = 'Only image and video files are allowed';
  //       return;
  //     }
      
  //     if (fileType === 'image' && file.size > 5 * 1024 * 1024) {
  //       this.uploadError = 'Image files must be less than 5MB';
  //       return;
  //     }
      
  //     if (fileType === 'video' && file.size > 20 * 1024 * 1024) {
  //       this.uploadError = 'Video files must be less than 20MB';
  //       return;
  //     }
  //   }
    
  //   // Process first file (in a real app, you might upload multiple)
  //   this.currentFile = files[0];
  //   this.uploadFile(this.currentFile);
  // }

  // uploadFile(file: File) {
  //   const fileType = file.type.split('/')[0] as 'image' | 'video';
    
  //   // Simulate upload progress
  //   this.uploadProgress = 0;
  //   const interval = setInterval(() => {
  //     this.uploadProgress += 10;
  //     if (this.uploadProgress >= 100) {
  //       clearInterval(interval);
  //       this.onUploadComplete(file, fileType);
  //     }
  //   }, 200);
  // }

  // onUploadComplete(file: File, type: 'image' | 'video') {
  //   // In a real app, you would have the URL from your API response
  //   const objectUrl = URL.createObjectURL(file);
    
  //   const newMedia: MediaItem = {
  //     id: Math.random().toString(36).substring(2, 9),
  //     name: file.name,
  //     url: objectUrl,
  //     type,
  //     size: file.size,
  //     uploadedAt: new Date()
  //   };
    
  //   this.mediaItems.unshift(newMedia);
  //   this.filterMedia();
    
  //   this.uploadProgress = 0;
  //   this.currentFile = null;
  // }

  // viewMedia(media: MediaItem) {
  //   this.previewMedia = media;
  // }

  // closePreview() {
  //   this.previewMedia = null;
  // }

  // copyMediaLink(url: string) {
  //   navigator.clipboard.writeText(url).then(() => {
  //     // Show success message
  //   });
  // }

  // deleteMedia(id: string) {
  //   if (confirm('Are you sure you want to delete this media file?')) {
  //     this.mediaItems = this.mediaItems.filter(item => item.id !== id);
  //     this.filterMedia();
  //   }
  // }
}
