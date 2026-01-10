import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemeService } from '../../shared/services/meme.service';
import { Tag } from '../../shared/interfaces/tag.interface';
import { UploadZoneComponent } from '../../shared/components/upload-zone/upload-zone.component';

@Component({
  selector: 'app-create-meme',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadZoneComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <h1 class="text-4xl font-bold mb-8">Créer un meme</h1>

      <form [formGroup]="memeForm" (ngSubmit)="onSubmit()">
        <!-- Upload Zone -->
        <div class="mb-6">
          <label class="label">
            <span class="label-text text-lg font-semibold">Image *</span>
          </label>
          <app-upload-zone (fileSelected)="onFileSelected($event)" />
          @if (memeForm.get('image')?.invalid && submitted) {
            <label class="label">
              <span class="label-text-alt text-error">Une image est requise</span>
            </label>
          }
        </div>

        <!-- Title -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text text-lg font-semibold">Titre *</span>
          </label>
          <input type="text" 
                 formControlName="title"
                 placeholder="Titre de votre meme" 
                 class="input input-bordered" />
          @if (memeForm.get('title')?.invalid && submitted) {
            <label class="label">
              <span class="label-text-alt text-error">Le titre est requis</span>
            </label>
          }
        </div>

        <!-- Tags -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text text-lg font-semibold">Tags</span>
          </label>
          <select multiple class="select select-bordered h-32" formControlName="tags">
            @for (tag of availableTags; track tag.id) {
              <option [value]="tag.id">{{ tag.name }}</option>
            }
          </select>
          <label class="label">
            <span class="label-text-alt">Maintenez Ctrl/Cmd pour sélectionner plusieurs tags</span>
          </label>
        </div>

        <!-- Error Message -->
        @if (errorMessage) {
          <div class="alert alert-error mb-6">
            <span>{{ errorMessage }}</span>
          </div>
        }

        <!-- Submit Buttons -->
        <div class="flex gap-4">
          <button type="submit" class="btn btn-primary flex-1" [disabled]="uploading || creating">
            @if (uploading || creating) {
              <span class="loading loading-spinner"></span>
              {{ uploading ? 'Upload...' : 'Création...' }}
            } @else {
              <span>Créer le meme</span>
            }
          </button>
          <button type="button" class="btn btn-ghost" (click)="cancel()">Annuler</button>
        </div>
      </form>
    </div>
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

  async onSubmit(): Promise<void> {
    this.submitted = true;
    
    if (this.memeForm.invalid || !this.selectedFile) {
      return;
    }

    try {
      // 1. Upload de l'image
      this.uploading = true;
      const imageId = await this.uploadImage();

      // 2. Créer le meme
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
          this.router.navigate(['/meme', meme.id]);
        },
        error: (error) => {
          this.creating = false;
          this.errorMessage = 'Erreur lors de la création du meme';
          console.error('Error creating meme:', error);
        }
      });
    } catch (error) {
      this.uploading = false;
      this.errorMessage = 'Erreur lors de l\'upload de l\'image';
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
