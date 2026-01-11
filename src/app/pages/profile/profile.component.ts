import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { MemeService } from '../../shared/services/meme.service';
import { Meme } from '../../shared/interfaces/meme.interface';
import { User } from '../../shared/interfaces/user.interface';

import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

import { EditProfileModalComponent } from './edit-profile-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent, ThemeToggleComponent, EditProfileModalComponent],
  template: `
    <!-- Header -->
    <header class="bg-[var(--color-bg)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div class="container-custom py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a routerLink="/gallery" class="btn-custom btn-secondary !px-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </a>
            <h1 class="text-xl font-bold text-gray-900">Mon Profil</h1>
          </div>
          <div class="flex items-center gap-4">
            <app-theme-toggle />
            <app-notification-bell />
            <button (click)="logout()" class="btn-custom btn-secondary text-red-600 hover:bg-red-50 border-red-200">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container-custom py-8">
      <!-- User Info -->
      @if (user) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 text-center relative group">
          <!-- Avatar Section -->
          <div class="relative w-24 h-24 mx-auto mb-4 cursor-pointer group/avatar" (click)="openEditModal()">
            @if (user.avatar) {
              <img [src]="memeService.getImageUrl(user.avatar)" 
                   alt="Profile" 
                   class="w-full h-full rounded-full object-cover shadow-md">
            } @else {
              <div class="w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-md">
                {{ user.first_name?.charAt(0) || '?' }}
              </div>
            }
            
            <!-- Avatar Edit Overlay -->
            <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            
            <!-- Plus/Edit Badge -->
            <div class="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-100 text-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
          </div>

          <!-- Name Section -->
          <div class="flex items-center justify-center gap-2 mb-1 group/name cursor-pointer" (click)="openEditModal()">
            <h2 class="text-2xl font-bold text-gray-900 group-hover/name:text-primary transition-colors">
              {{ user.first_name }} {{ user.last_name }}
            </h2>
            <button class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 group-hover/name:opacity-100" 
                    title="Modifier le nom">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </button>
          </div>
          
          <p class="text-gray-500 mb-6">{{ user.email }}</p>
          
          <!-- Stats Section -->
          <div class="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div class="text-2xl font-bold text-blue-600">{{ memes.length }}</div>
              <div class="text-sm text-blue-600/70">Mèmes</div>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
              <div class="text-2xl font-bold text-red-500">{{ totalLikes }}</div>
              <div class="text-sm text-red-500/70">Likes</div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div class="text-2xl font-bold text-purple-600">{{ totalViews }}</div>
              <div class="text-sm text-purple-600/70">Vues</div>
            </div>
          </div>
        </div>
      }

      @if (showEditModal) {
        <app-edit-profile-modal 
          [user]="user" 
          (save)="onProfileUpdate($event)" 
          (close)="closeEditModal()">
        </app-edit-profile-modal>
      }

      <!-- My Memes -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-gray-900">Mes Mèmes</h3>

        @if (loading) {
          <div class="flex justify-center py-12">
            <div class="spinner w-8 h-8"></div>
          </div>
        } @else if (memes.length === 0) {
          <div class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p class="text-gray-500 mb-4">Vous n'avez pas encore créé de mème</p>
            <a routerLink="/create" class="btn-custom btn-primary">Créer mon premier mème</a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (meme of memes; track meme.id) {
              <article class="card-custom group">
                <!-- Image -->
                <a [routerLink]="['/meme', meme.id]" class="block relative aspect-square overflow-hidden bg-gray-100">
                  <img [src]="memeService.getImageUrl(meme.image)" 
                       [alt]="meme.title"
                       class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                       loading="lazy" />
                  
                  <!-- Overlay Actions -->
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button (click)="deleteMeme($event, meme.id)" 
                            class="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer le mème">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </a>

                <!-- Content -->
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{{ meme.title }}</h3>
                  <div class="flex items-center justify-between text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      {{ meme.views }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {{ meme.likes }}
                    </span>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </main>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  memes: Meme[] = [];
  loading = true;
  showEditModal = false;

  get totalLikes(): number {
    return this.memes.reduce((sum, meme) => sum + (meme.likes || 0), 0);
  }

  get totalViews(): number {
    return this.memes.reduce((sum, meme) => sum + (meme.views || 0), 0);
  }

  constructor(
    private authService: AuthService,
    public memeService: MemeService,
    private router: Router
  ) {}

  openEditModal(): void {
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onProfileUpdate(data: { first_name: string; last_name: string; avatar?: string }): void {
    const updateData: any = {
      first_name: data.first_name,
      last_name: data.last_name
    };
    if (data.avatar) {
      updateData.avatar = data.avatar;
    }

    this.authService.updateUser(updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        alert('Erreur lors de la mise à jour du profil');
        this.closeEditModal(); // Close anyway or keep open? Keep open usually better but simplest is close.
      }
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadUserMemes(user.id);
      }
    });
  }

  loadUserMemes(userId: string): void {
    this.loading = true;
    this.memeService.getMemes({
      filter: {
        user_created: {
          _eq: userId
        }
      },
      sort: '-date_created'
    }).subscribe({
      next: (memes) => {
        this.memes = memes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user memes:', error);
        this.loading = false;
      }
    });
  }

  deleteMeme(event: Event, memeId: string): void {
    event.stopPropagation();
    event.preventDefault();
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mème ?')) {
      this.memeService.deleteMeme(memeId).subscribe({
        next: () => {
          this.memes = this.memes.filter(m => m.id !== memeId);
        },
        error: (error) => {
          console.error('Error deleting meme:', error);
          alert('Failed to delete meme');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
