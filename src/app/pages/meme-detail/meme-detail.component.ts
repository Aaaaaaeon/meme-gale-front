import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MemeService } from '../../shared/services/meme.service';
import { AuthService } from '../../shared/services/auth.service';
import { Meme } from '../../shared/interfaces/meme.interface';

import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-meme-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent, ThemeToggleComponent],
  template: `
    <!-- Header -->
    <header class="bg-[var(--color-bg)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div class="container-custom py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button (click)="goBack()" class="btn-custom btn-secondary !px-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-900 line-clamp-1">
              {{ meme?.title || 'Chargement...' }}
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <app-theme-toggle />
            <app-notification-bell />
          </div>
        </div>
      </div>
    </header>

    <main class="container-custom py-8">
      @if (loading) {
        <div class="flex justify-center items-center min-h-[400px]">
          <div class="spinner w-12 h-12"></div>
        </div>
      } @else if (meme) {
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Image Container -->
            <div class="bg-gray-50 flex items-center justify-center p-4 min-h-[400px]">
              <img [src]="getImageUrl()" 
                   [alt]="meme!.title"
                   class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-sm" />
            </div>

            <!-- Content -->
            <div class="p-6 md:p-8">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ meme!.title }}</h1>
                  
                  <div class="flex items-center gap-3 text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                      @if (getAuthorAvatar()) {
                        <img [src]="memeService.getImageUrl(getAuthorAvatar()!)" 
                             alt="Avatar" 
                             class="w-8 h-8 rounded-full object-cover">
                      } @else {
                        <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                          {{ getAuthorInitial() }}
                        </div>
                      }
                      <span class="font-medium text-gray-900">{{ getAuthorName() }}</span>
                    </div>
                    <span>•</span>
                    <span>{{ meme!.date_created | date:'mediumDate' }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-3">
                  @if (isAuthenticated()) {
                    <button (click)="toggleLike()" 
                            class="btn-custom relative"
                            [class.btn-primary]="isLiked"
                            [class.bg-gray-100]="!isLiked"
                            [class.text-gray-900]="!isLiked"
                            [class.like-animation]="likeAnimating">
                      <svg class="w-5 h-5" 
                           [attr.fill]="isLiked ? 'currentColor' : 'none'" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                      @if (likeAnimating && isLiked) {
                        <span class="like-burst"></span>
                      }
                      @if (isLiked) {
                        <span>Aimé</span>
                      } @else {
                        <span>J'aime</span>
                      }
                    </button>
                  }
                  
                  <!-- Share (Dummy) -->
                  <button class="btn-custom btn-secondary !px-3" title="Partager">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Stats -->
              <div class="flex items-center gap-6 py-6 border-y border-gray-100 mb-6">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span class="font-semibold text-gray-900">{{ meme!.views }}</span>
                  <span class="text-gray-500">Vues</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span class="font-semibold text-gray-900">{{ meme!.likes }}</span>
                  <span class="text-gray-500">J'aimes</span>
                </div>
              </div>

              <!-- Tags -->
              @if (meme!.tags && meme!.tags!.length > 0) {
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Tags</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (tag of meme!.tags; track tag.tags_id.id) {
                      <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 connection-colors cursor-default">
                        #{{ tag.tags_id.name }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </main>
  `
})
export class MemeDetailComponent implements OnInit {
  meme: Meme | null = null;
  loading = true;
  isLiked = false;
  likeAnimating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public memeService: MemeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMeme(id);
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadMeme(id: string): void {
    this.memeService.getMemeById(id).subscribe({
      next: (meme) => {
        this.meme = meme;
        this.checkIfLiked(id);
        this.incrementViews(id, meme.views);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading meme:', error);
        this.loading = false;
      }
    });
  }

  checkIfLiked(id: string): void {
    if (this.isAuthenticated()) {
      this.memeService.getLikeStatus(id).subscribe({
        next: (status) => {
          this.isLiked = status.liked;
        }
      });
    }
  }

  incrementViews(id: string, currentViews: number): void {
    this.memeService.incrementViews(id, currentViews).subscribe();
  }

  toggleLike(): void {
    if (!this.meme) return;

    this.memeService.toggleLike(this.meme.id).subscribe({
      next: (response) => {
        const wasLiked = this.isLiked;
        this.isLiked = response.liked;
        if (this.meme) {
          this.meme.likes = response.totalLikes;
        }
        
        // Trigger animation only on like (not unlike)
        if (!wasLiked && response.liked) {
          this.likeAnimating = true;
          setTimeout(() => this.likeAnimating = false, 600);
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  getImageUrl(): string {
    return this.meme ? this.memeService.getImageUrl(this.meme.image, 1200) : '';
  }

  getAuthorInitial(): string {
    if (this.meme && typeof this.meme.user_created === 'object' && this.meme.user_created?.first_name) {
      return this.meme.user_created.first_name.charAt(0).toUpperCase();
    }
    return '?';
  }

  getAuthorName(): string {
    if (this.meme && typeof this.meme.user_created === 'object' && this.meme.user_created?.first_name) {
      return this.meme.user_created.first_name;
    }
    return 'Anonyme';
  }

  getAuthorAvatar(): string | null {
    if (this.meme && typeof this.meme.user_created === 'object' && this.meme.user_created?.avatar) {
      return this.meme.user_created.avatar;
    }
    return null;
  }

  goBack(): void {
    this.router.navigate(['/gallery']);
  }
}
