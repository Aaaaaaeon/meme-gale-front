import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MemeService } from '../../shared/services/meme.service';
import { Tag } from '../../shared/interfaces/tag.interface';
import { UploadZoneComponent } from '../../shared/components/upload-zone/upload-zone.component';

import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-create-meme',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadZoneComponent, RouterModule, NotificationBellComponent],
  template: `
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="container-custom py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a routerLink="/gallery" class="btn-custom btn-secondary !px-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </a>
            <h1 class="text-xl font-bold text-gray-900">Créer un mème</h1>
          </div>
          <app-notification-bell />
        </div>
      </div>
    </header>

    <main class="container-custom py-8">
      <div class="max-w-3xl mx-auto">
        <form [formGroup]="memeForm" (ngSubmit)="onSubmit()">
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Détails du mème</h2>
              <p class="text-sm text-gray-500">Partagez votre créativité avec le monde</p>
            </div>
            
            <div class="p-6 space-y-6">
              <!-- Upload Zone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <app-upload-zone (fileSelected)="onFileSelected($event)" />
                @if (memeForm.get('image')?.invalid && submitted) {
                  <p class="text-sm text-red-600 mt-2">Veuillez télécharger une image</p>
                }
              </div>

              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input type="text" 
                       formControlName="title"
                       placeholder="Donnez un titre accrocheur..." 
                       class="input-custom text-lg" />
                @if (memeForm.get('title')?.invalid && submitted) {
                  <p class="text-sm text-red-600 mt-1">Le titre est requis</p>
                }
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  @for (tag of availableTags; track tag.id) {
                    <label class="relative flex cursor-pointer group">
                      <input type="checkbox" 
                             [value]="tag.id"
                             (change)="onTagChange($event, tag.id)"
                             class="peer sr-only" />
                      <div class="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg peer-checked:bg-blue-50 peer-checked:text-primary peer-checked:border-primary transition-all hover:bg-gray-100">
                        #{{ tag.name }}
                      </div>
                    </label>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          @if (errorMessage) {
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>
          }

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <button type="button" 
                    (click)="cancel()"
                    class="btn-custom btn-secondary">
              Annuler
            </button>
            <button type="submit" 
                    class="btn-custom btn-primary px-8"
                    [disabled]="uploading || creating">
              @if (uploading || creating) {
                <div class="spinner w-4 h-4 text-white"></div>
                {{ uploading ? 'Envoi...' : 'Publication...' }}
              } @else {
                Publier le mème
              }
            </button>
          </div>
        </form>
      </div>
    </main>
  `
})
export class CreateMemeComponent {
  memeForm: FormGroup;
  availableTags: Tag[] = [];
  selectedFile: File | null = null;
  submitted = false;
  uploading = false;
  creating = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private memeService: MemeService,
    private router: Router
  ) {
    this.memeForm = this.fb.group({
      title: ['', Validators.required],
      image: ['', Validators.required],
      tags: [[]],
      status: ['published']
    });

    this.loadTags();
  }

  loadTags(): void {
    this.memeService.getTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      }
    });
  }

  onFileSelected(file: File): void {
    this.selectedFile = file;
    this.memeForm.patchValue({ image: file ? 'selected' : '' });
  }

  onTagChange(event: Event, tagId: string): void {
    const checkbox = event.target as HTMLInputElement;
    const currentTags = this.memeForm.get('tags')?.value as string[];
    
    if (checkbox.checked) {
      this.memeForm.patchValue({ tags: [...currentTags, tagId] });
    } else {
      this.memeForm.patchValue({ tags: currentTags.filter(id => id !== tagId) });
    }
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    
    if (this.memeForm.invalid || !this.selectedFile) {
      return;
    }

    try {
      this.uploading = true;
      const imageId = await this.uploadImage();

      this.uploading = false;
      this.creating = true;

      const formValue = this.memeForm.value;
      const memeData = {
        title: formValue.title,
        image: imageId,
        status: formValue.status,
        tags: formValue.tags.map((tagId: string) => ({ tags_id: tagId }))
      };

      this.memeService.createMeme(memeData).subscribe({
        next: (meme) => {
          this.router.navigate(['/gallery']); // Go back to gallery instead of detail for flow
        },
        error: (error) => {
          this.creating = false;
          this.errorMessage = 'Erreur lors de la création du mème. Réessayez.';
          console.error('Error creating meme:', error);
        }
      });
    } catch (error) {
      this.uploading = false;
      this.creating = false;
      this.errorMessage = "Erreur lors de l'envoi de l'image.";
      console.error('Error:', error);
    }
  }

  private uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No file selected');
        return;
      }

      this.memeService.uploadImage(this.selectedFile).subscribe({
        next: (imageId) => resolve(imageId),
        error: (error) => reject(error)
      });
    });
  }

  cancel(): void {
    this.router.navigate(['/gallery']);
  }
}
