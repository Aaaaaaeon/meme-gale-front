import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div 
        class="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-primary hover:bg-gray-50 group"
        [class.border-primary]="isDragging"
        [class.bg-blue-50]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <input 
          #fileInput
          type="file" 
          accept="image/*" 
          class="hidden" 
          (change)="onFileSelected($event)">

        <div class="space-y-4">
          <!-- Icon -->
          <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <svg class="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>

          <!-- Text -->
          <div>
            <p class="text-base font-medium text-gray-900">
              Cliquez ou glissez-déposez ici
            </p>
            <p class="text-sm text-gray-500 mt-1">
              SVG, PNG, JPG ou GIF (max. 5Mo)
            </p>
          </div>
        </div>
      </div>

      <!-- Preview -->
      @if (previewUrl) {
        <div class="mt-6 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm animate-fade-in group">
          <img [src]="previewUrl" class="w-full h-64 object-cover" alt="Preview">
          <button 
            type="button"
            (click)="clearFile($event)"
            class="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class UploadZoneComponent {
  @Output() fileSelected = new EventEmitter<File>();
  isDragging = false;
  previewUrl: string | null = null;

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

  private handleFile(file: File): void {
    if (file.type.startsWith('image/')) {
      this.previewUrl = URL.createObjectURL(file);
      this.fileSelected.emit(file);
    }
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.previewUrl = null;
    // Emit null or handle clear if needed, for now just UI reset
    // Ideally we might want to emit null to parent
  }
}
