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
}
