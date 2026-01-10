import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemeService } from '../../shared/services/meme.service';
import { AuthService } from '../../shared/services/auth.service';
import { Meme } from '../../shared/interfaces/meme.interface';
import { MemeCardComponent } from '../../shared/components/meme-card/meme-card.component';

@Component({
  selector: 'app-meme-galery',
  standalone: true,
  imports: [CommonModule, RouterModule, MemeCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">Meme Gallery</h1>
        @if (isAuthenticated()) {
          <a routerLink="/create" class="btn btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Créer un meme
          </a>
        }
      </div>

      <!-- Search & Filters -->
      <div class="mb-8">
        <input type="text" placeholder="Rechercher des memes..." 
               class="input input-bordered w-full max-w-md" 
               (input)="onSearch($event)" />
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="flex justify-center items-center py-20">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      }

      <!-- Grid de memes -->
      @if (!loading && memes.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (meme of memes; track meme.id) {
            <div [routerLink]="['/meme', meme.id]">
              <app-meme-card [meme]="meme" 
                             [isLiked]="likedMemes.has(meme.id)"
                             [showLikeButton]="isAuthenticated()"
                             (likeToggled)="toggleLike($event)" />
            </div>
          }
        </div>

        <!-- Load More -->
        @if (hasMore) {
          <div class="text-center mt-8">
            <button class="btn btn-outline" (click)="loadMore()" [disabled]="loading">
              Charger plus
            </button>
          </div>
        }
      }

      <!-- Empty State -->
      @if (!loading && memes.length === 0) {
        <div class="text-center py-20">
          <p class="text-xl opacity-70">Aucun meme trouvé</p>
          @if (isAuthenticated()) {
            <a routerLink="/create" class="btn btn-primary mt-4">Créer le premier meme</a>
          } @else {
            <a routerLink="/login" class="btn btn-primary mt-4">Se connecter pour créer un meme</a>
          }
        </div>
      }
    </div>
  `
})
export class MemeGaleryComponent implements OnInit {
  memes: Meme[] = [];
  likedMemes = new Set<string>();
  loading = true;
  hasMore = false;
  currentOffset = 0;
  limit = 20;

  constructor(
    private memeService: MemeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMemes();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadMemes(): void {
    this.loading = true;
    this.memeService.getMemes({
      limit: this.limit,
      offset: this.currentOffset
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
    this.memeService.toggleLike(memeId).subscribe({
      next: (response) => {
        if (response.liked) {
          this.likedMemes.add(memeId);
        } else {
          this.likedMemes.delete(memeId);
        }
        
        // Mettre à jour le compteur de likes
        const meme = this.memes.find(m => m.id === memeId);
        if (meme) {
          meme.likes = response.totalLikes;
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    // TODO: Implémenter la recherche avec debounce
    console.log('Search:', query);
  }
}
