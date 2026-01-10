import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-2 border-dashed border-gray-600 hover:border-primary rounded-lg p-8 text-center cursor-pointer transition-all min-h-[300px] flex items-center justify-center hover:bg-base-200" 
         [class.border-primary]="isDragging"
         [class.bg-primary]="isDragging"
         [class.bg-opacity-10]="isDragging"
         (drop)="onDrop($event)" 
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (click)="fileInput.click()">
      
      @if (preview) {
        <div class="relative w-full">
          <img [src]="preview" alt="Preview" class="max-h-96 mx-auto rounded-lg" />
          <button type="button" class="btn btn-circle btn-sm btn-error absolute top-2 right-2" 
                  (click)="removeFile($event)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center">
          <svg class="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p class="mt-4 text-lg font-semibold">Glissez une image ici</p>
          <p class="text-sm opacity-70">ou cliquez pour parcourir</p>
          <p class="text-xs opacity-50 mt-2">PNG, JPG, GIF jusqu'à 10MB</p>
        </div>
      }

      <input #fileInput type="file" accept="image/*" class="hidden" 
             (change)="onFileSelected($event)" />
    </div>
  `,
  styles: []
})
export class UploadZoneComponent {
  @Output() fileSelected = new EventEmitter<File>();
  
  preview: string | null = null;
  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 10 MB');
      return;
    }

    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      this.preview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Émettre le fichier
    this.fileSelected.emit(file);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.preview = null;
    this.fileSelected.emit(undefined as any); // Reset
  }
}
