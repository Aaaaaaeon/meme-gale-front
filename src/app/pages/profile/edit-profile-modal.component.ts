import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../shared/interfaces/user.interface';
import { MemeService } from '../../shared/services/meme.service';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="cancel()"></div>

      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <h3 class="text-xl font-semibold leading-6 text-gray-900 mb-4" id="modal-title">
              Modifier mon profil
            </h3>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Avatar Upload -->
              <div class="flex justify-center mb-6">
                <div class="relative group cursor-pointer" (click)="fileInput.click()">
                  <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    @if (previewUrl || currentAvatarUrl) {
                      <img [src]="previewUrl || currentAvatarUrl" class="w-full h-full object-cover" />
                    } @else {
                      <span class="text-3xl text-gray-400 font-bold">{{ getInitial() }}</span>
                    }
                  </div>
                  <div class="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                </div>
                <input #fileInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
              </div>

              <!-- Name Fields -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Prénom</label>
                  <input type="text" formControlName="first_name" class="input-custom mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nom</label>
                  <input type="text" formControlName="last_name" class="input-custom mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button type="button" 
                    (click)="onSubmit()"
                    [disabled]="uploading || form.invalid"
                    class="btn-custom btn-primary w-full sm:w-auto sm:ml-3">
              {{ uploading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button type="button" 
                    (click)="cancel()"
                    class="btn-custom btn-secondary w-full sm:w-auto mt-3 sm:mt-0">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditProfileModalComponent {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<{ first_name: string; last_name: string; avatar?: string }>();
  @Output() close = new EventEmitter<void>();

  form: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  currentAvatarUrl: string | null = null;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private memeService: MemeService
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.user) {
      this.form.patchValue({
        first_name: this.user.first_name,
        last_name: this.user.last_name
      });
      if (this.user.avatar) {
        this.currentAvatarUrl = this.memeService.getImageUrl(this.user.avatar);
      }
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getInitial(): string {
    return this.form.get('first_name')?.value?.charAt(0)?.toUpperCase() || '?';
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.uploading = true;
    try {
      let avatarId = undefined;
      
      // Upload avatar if changed
      if (this.selectedFile) {
        avatarId = await new Promise<string>((resolve, reject) => {
          this.memeService.uploadImage(this.selectedFile!).subscribe({
            next: (id) => resolve(id),
            error: (err) => reject(err)
          });
        });
      }

      this.save.emit({
        ...this.form.value,
        avatar: avatarId // Undefined if not changed, effectively merged later? 
        // Wait, if undefined, we shouldn't send it if we want to keep old one?
        // Ah, the user of this component should handle it. 
        // But if I pass undefined to patch, Directus ignores it? Yes.
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      this.uploading = false;
    }
  }

  cancel() {
    this.close.emit();
  }
}
