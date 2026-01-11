import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        @if (error) {
          <div class="text-red-600 mb-4">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="font-semibold">{{ error }}</p>
          </div>
          <a routerLink="/login" class="btn-custom btn-primary">Retour à la connexion</a>
        } @else {
          <div class="spinner w-12 h-12 mx-auto mb-4"></div>
          <p class="text-gray-600">Connexion en cours...</p>
        }
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get tokens from query params (Directus OAuth callback)
    const accessToken = this.route.snapshot.queryParams['access_token'];
    const refreshToken = this.route.snapshot.queryParams['refresh_token'];
    const expires = this.route.snapshot.queryParams['expires'];

    if (accessToken) {
      // Store tokens and fetch user
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      // Fetch user info and redirect
      this.authService.fetchCurrentUser().subscribe({
        next: () => {
          this.router.navigate(['/gallery']);
        },
        error: () => {
          this.error = 'Erreur lors de la récupération du profil';
        }
      });
    } else {
      this.error = 'Authentification échouée';
    }
  }
}
