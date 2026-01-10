import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meme } from '../../interfaces/meme.interface';
import { MemeService } from '../../services/meme.service';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
         (click)="onCardClick()">
      <!-- Image du meme -->
      <figure class="aspect-square overflow-hidden">
        <img [src]="getImageUrl()" [alt]="meme.title" 
             class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </figure>

      <div class="card-body p-4">
        <!-- Titre -->
        <h2 class="card-title text-lg font-bold line-clamp-2">{{ meme.title }}</h2>

        <!-- Stats -->
        <div class="flex items-center gap-4 text-sm opacity-70 mt-2">
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span>{{ meme.views }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{{ meme.likes }}</span>
          </div>
        </div>

        <!-- Tags -->
        @if (meme.tags && meme.tags.length > 0) {
          <div class="flex flex-wrap gap-1 mt-3">
            @for (tagRelation of meme.tags.slice(0, 3); track tagRelation.id) {
              <span class="badge badge-sm badge-primary">{{ tagRelation.tags_id.name }}</span>
            }
            @if (meme.tags.length > 3) {
              <span class="badge badge-sm badge-ghost">+{{ meme.tags.length - 3 }}</span>
            }
          </div>
        }

        <!-- Bouton Like -->
        @if (showLikeButton) {
          <div class="card-actions justify-end mt-3">
            <button class="btn btn-circle btn-sm btn-ghost" 
                    (click)="onLike($event)"
                    [class.text-error]="isLiked">
              <svg class="w-5 h-5" [attr.fill]="isLiked ? 'currentColor' : 'none'" 
                   stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MemeCardComponent {
  @Input() meme!: Meme;
  @Input() isLiked: boolean = false;
  @Input() showLikeButton: boolean = true;
  @Output() likeToggled = new EventEmitter<string>();

  constructor(private memeService: MemeService) {}

  getImageUrl(): string {
    return this.memeService.getImageUrl(this.meme.image, 400);
  }

  onCardClick(): void {
    // La navigation est gérée par le routerLink dans le parent
  }

  onLike(event: Event): void {
    event.stopPropagation(); // Empêcher la navigation vers le détail
    this.likeToggled.emit(this.meme.id);
  }
}
