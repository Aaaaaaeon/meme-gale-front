import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h1>
          <p class="text-gray-600">Connectez-vous pour continuer</p>
        </div>

        <!-- Login Form -->
        <div class="card-custom p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" 
                     formControlName="email"
                     placeholder="vous@exemple.com" 
                     class="input-custom"
                     [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" />
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <p class="text-sm text-red-600 mt-1">Veuillez entrer un email valide</p>
              }
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input type="password" 
                     formControlName="password"
                     placeholder="••••••••" 
                     class="input-custom"
                     [class.input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" />
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <p class="text-sm text-red-600 mt-1">Le mot de passe est requis</p>
              }
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
            }

            <!-- Submit Button -->
            <button type="submit" 
                    class="btn-custom btn-primary w-full mb-4"
                    [disabled]="loginForm.invalid || loading">
              @if (loading) {
                <div class="spinner w-4 h-4"></div>
                Connexion...
              } @else {
                Se connecter
              }
            </button>

            <!-- Guest Access -->
            <button type="button"
                    (click)="continueAsGuest()" 
                    class="btn-custom btn-secondary w-full mb-6">
              Continuer en tant qu'invité
            </button>

            <!-- OAuth Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <!-- OAuth Buttons -->
            <button type="button"
                    (click)="loginWithGoogle()" 
                    class="btn-custom w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 mb-4">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <!-- Register Link -->
            <p class="text-center text-sm text-gray-600">
              Pas encore de compte ? 
              <a routerLink="/register" class="font-medium text-primary hover:text-primary-dark ml-1">S'inscrire</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;
    
    this.authService.login(credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/gallery';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Email ou mot de passe invalide';
      }
    });
  }

  continueAsGuest(): void {
    this.router.navigate(['/gallery']);
  }

  /**
   * Redirect to Directus OAuth Google endpoint
   */
  loginWithGoogle(): void {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `http://localhost:8055/auth/login/google?redirect=${encodeURIComponent(redirectUrl)}`;
  }
}

