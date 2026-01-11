import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MemeService } from '../../shared/services/meme.service';
import { AuthService } from '../../shared/services/auth.service';
import { Meme } from '../../shared/interfaces/meme.interface';

import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-meme-galery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationBellComponent, ThemeToggleComponent, SkeletonCardComponent, SearchBarComponent],
  template: `
    <!-- Professional Header -->
    <header class="bg-[var(--color-bg)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div class="container-custom py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-8">
            <h1 class="text-2xl font-bold text-gray-900">MemeGale</h1>
            <nav class="hidden md:flex gap-6">
              <a routerLink="/gallery" class="text-sm font-medium text-primary hover:text-primary-dark">Galerie</a>
              @if (isAuthenticated()) {
                <a routerLink="/profile" class="text-sm font-medium text-gray-600 hover:text-gray-900">Mon Profil</a>
              }
            </nav>
          </div>
          
          <!-- Search Bar -->
          <div class="hidden md:block flex-1 max-w-md mx-4">
            <app-search-bar />
          </div>
          
          <div class="flex items-center gap-3">
            <app-theme-toggle />
            @if (isAuthenticated()) {
              <app-notification-bell />
              <button (click)="navigateToCreate()" class="btn-custom btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nouveau mème
              </button>
            } @else {
              <a routerLink="/login" class="btn-custom btn-secondary">Connexion</a>
            }
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container-custom py-8">
      <!-- Hero Section -->
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold text-gray-900 mb-3">Découvrez des mèmes incroyables</h2>
        <p class="text-lg text-gray-600 mb-6">Partagez des rires avec la communauté</p>
        
        <!-- Sort Filter -->
        <div class="flex justify-center">
          <div class="inline-flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2">
            <label class="text-sm text-gray-600">Trier par :</label>
            <select 
              [(ngModel)]="sortOption" 
              (change)="onSortChange()"
              class="bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer">
              <option value="-likes">Popularité</option>
              <option value="-date_created">Date de publication</option>
              <option value="title">Ordre alphabétique</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State (Skeleton) -->
      @if (loading && memes.length === 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <app-skeleton-card />
          }
        </div>
      }

      <!-- Empty State -->
      @else if (memes.length === 0) {
        <div class="text-center py-20">
          <svg class="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Aucun mème pour l'instant</h3>
          <p class="text-gray-500 mb-6">Soyez le premier à partager un mème !</p>
          @if (isAuthenticated()) {
            <button (click)="navigateToCreate()" class="btn-custom btn-primary">Créer le premier mème</button>
          } @else {
            <a routerLink="/login" class="btn-custom btn-primary">Connectez-vous pour poster</a>
          }
        </div>
      }

      <!-- Memes Grid -->
      @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (meme of memes; track meme.id) {
            <article class="card-custom animate-fade-in">
              <!-- Image -->
              <a [routerLink]="['/meme', meme.id]" class="block relative aspect-square overflow-hidden bg-gray-100">
                <img [src]="memeService.getImageUrl(meme.image)" 
                     [alt]="meme.title"
                     class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                     loading="lazy" />
              </a>

              <!-- Content -->
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ meme.title }}</h3>
                
                <!-- Tags -->
                @if (meme.tags && meme.tags.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-3">
                    @for (tag of meme.tags.slice(0, 3); track tag.tags_id.id) {
                      <span class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                        {{ tag.tags_id.name }}
                      </span>
                    }
                  </div>
                }

                <!-- Footer -->
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                  <!-- Author -->
                  <div class="flex items-center gap-2">
                    @if (getAuthorAvatar(meme)) {
                      <img [src]="memeService.getImageUrl(getAuthorAvatar(meme))" 
                           alt="Avatar" 
                           class="w-8 h-8 rounded-full object-cover">
                    } @else {
                      <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                        {{ getAuthorInitial(meme) }}
                      </div>
                    }
                    <span class="text-sm text-gray-600 truncate max-w-[100px]">{{ getAuthorName(meme) }}</span>
                  </div>

                  <!-- Stats -->
                  <div class="flex items-center gap-3">
                    <!-- Views -->
                    <div class="flex items-center gap-1 text-xs text-gray-400" title="Vues">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      {{ meme.views }}
                    </div>

                    <!-- Likes -->
                    <button (click)="isAuthenticated() && toggleLike(meme.id)"
                            [disabled]="!isAuthenticated()"
                            class="flex items-center gap-1 text-xs font-medium transition-colors"
                            [class.text-red-500]="likedMemes.has(meme.id)"
                            [class.text-gray-500]="!likedMemes.has(meme.id)"
                            [class.hover:text-red-500]="isAuthenticated()">
                      <svg class="w-4 h-4" [attr.fill]="likedMemes.has(meme.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                      {{ meme.likes }}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          }
        </div>

        <!-- Infinite Scroll Sentinel -->
        <div #scrollSentinel class="h-4 w-full"></div>
        
        @if (loading && memes.length > 0) {
          <div class="flex justify-center mt-8">
            <div class="spinner w-8 h-8"></div>
          </div>
        }
      }
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--color-bg-secondary);
    }
  `]
})
export class MemeGaleryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;
  
  memes: Meme[] = [];
  likedMemes = new Set<string>();
  loading = false;
  hasMore = true;
  currentOffset = 0;
  limit = 20;
  sortOption = '-likes'; // Default: popularity
  private intersectionObserver?: IntersectionObserver;

  constructor(
    public memeService: MemeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMemes();
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  private setupInfiniteScroll(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !this.loading && this.hasMore) {
          this.loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    if (this.scrollSentinel?.nativeElement) {
      this.intersectionObserver.observe(this.scrollSentinel.nativeElement);
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  onSortChange(): void {
    // Reset and reload with new sort
    this.memes = [];
    this.currentOffset = 0;
    this.hasMore = true;
    this.loadMemes();
  }

  loadMemes(): void {
    this.loading = true;
    this.memeService.getMemes({
      limit: this.limit,
      offset: this.currentOffset,
      sort: this.sortOption
    }).subscribe({
      next: (memes) => {
        this.memes.push(...memes);
        this.hasMore = memes.length === this.limit;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading memes:', error);
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    this.currentOffset += this.limit;
    this.loadMemes();
  }

  toggleLike(memeId: string): void {
    if (this.likedMemes.has(memeId)) {
      this.likedMemes.delete(memeId);
    } else {
      this.likedMemes.add(memeId);
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/create']);
  }

  getAuthorInitial(meme: Meme): string {
    if (typeof meme.user_created === 'object' && meme.user_created?.first_name) {
      return meme.user_created.first_name.charAt(0).toUpperCase();
    }
    return '?';
  }

  getAuthorName(meme: Meme): string {
    if (typeof meme.user_created === 'object' && meme.user_created?.first_name) {
      return meme.user_created.first_name;
    }
    return 'Anonymous';
  }

  getAuthorAvatar(meme: Meme): string | null {
    if (typeof meme.user_created === 'object' && meme.user_created?.avatar) {
      return meme.user_created.avatar;
    }
    return null;
  }
}
