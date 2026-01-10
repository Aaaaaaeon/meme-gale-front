import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router, RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { MemeService } from '../../shared/services/meme.service';
import { Meme } from '../../shared/interfaces/meme.interface';

@Component({
  selector: 'app-meme-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (loading) {
        <div class="flex justify-center items-center min-h-screen">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      }

      @if (meme) {
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="mb-6">
            <button class="btn btn-ghost btn-sm" (click)="goBack()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Retour
            </button>
          </div>

          <!-- Image -->
          <div class="card bg-base-200 shadow-2xl">
            <figure>
              <img [src]="getImageUrl()" [alt]="meme.title" class="w-full h-auto max-h-[600px] object-contain" />
            </figure>

            <div class="card-body">
              <!-- Title -->
              <h1 class="card-title text-3xl font-bold">{{ meme.title }}</h1>

              <!-- Stats & Actions -->
              <div class="flex items-center justify-between my-4">
                <div class="flex items-center gap-6 text-lg">
                  <span class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    {{ meme.views }}
                  </span>

                  <span class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {{ meme.likes }}
                  </span>
                </div>

                <button class="btn btn-circle btn-lg" 
                        (click)="toggleLike()"
                        [class.btn-error]="isLiked">
                  <svg class="w-6 h-6" [attr.fill]="isLiked ? 'currentColor' : 'none'" 
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>

              <!-- Tags -->
              @if (meme.tags && meme.tags.length > 0) {
                <div class="flex flex-wrap gap-2 mt-4">
                  @for (tagRelation of meme.tags; track tagRelation.id) {
                    <span class="badge badge-primary badge-lg">{{ tagRelation.tags_id.name }}</span>
                  }
                </div>
              }

              <!-- Date -->
              <div class="text-sm opacity-70 mt-4">
                Publié le {{ meme.date_created | date:'medium' }}
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MemeDetailComponent implements OnInit {
  meme: Meme | null = null;
  loading = true;
  isLiked = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memeService: MemeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMeme(id);
    }
  }

  loadMeme(id: string): void {
    this.memeService.getMemeById(id).subscribe({
      next: (meme) => {
        this.meme = meme;
        this.incrementViews(id, meme.views);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading meme:', error);
        this.loading = false;
      }
    });
  }

  incrementViews(id: string, currentViews: number): void {
    this.memeService.incrementViews(id, currentViews).subscribe();
  }

  toggleLike(): void {
    if (!this.meme) return;

    this.memeService.toggleLike(this.meme.id).subscribe({
      next: (response) => {
        this.isLiked = response.liked;
        if (this.meme) {
          this.meme.likes = response.totalLikes;
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  getImageUrl(): string {
    return this.meme ? this.memeService.getImageUrl(this.meme.image, 800) : '';
  }

  goBack(): void {
    this.router.navigate(['/gallery']);
  }
}
