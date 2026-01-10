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
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-full max-w-md bg-base-100 shadow-2xl">
        <div class="card-body">
          <h2 class="card-title text-3xl font-bold text-center mb-6">Meme Gallery</h2>
          <p class="text-center opacity-70 mb-4">Connectez-vous pour continuer</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input type="email" 
                     formControlName="email"
                     placeholder="votre@email.com" 
                     class="input input-bordered" 
                     [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" />
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <label class="label">
                  <span class="label-text-alt text-error">Email invalide</span>
                </label>
              }
            </div>

            <!-- Password -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">Mot de passe</span>
              </label>
              <input type="password" 
                     formControlName="password"
                     placeholder="••••••••" 
                     class="input input-bordered"
                     [class.input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" />
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <label class="label">
                  <span class="label-text-alt text-error">Mot de passe requis</span>
                </label>
              }
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="alert alert-error mt-4">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <!-- Submit Button -->
            <div class="form-control mt-6">
              <button type="submit" 
                      class="btn btn-primary" 
                      [disabled]="loginForm.invalid || loading"
                      [class.loading]="loading">
                @if (loading) {
                  <span class="loading loading-spinner"></span>
                } @else {
                  <span>Se connecter</span>
                }
              </button>
            </div>
          </form>

          <!-- Guest Access -->
          <div class="divider">OU</div>
          <button class="btn btn-ghost" (click)="continueAsGuest()">
            Continuer en tant qu'invité
          </button>
          
          <p class="text-center mt-4">
            Pas encore de compte ? 
            <a routerLink="/register" class="link link-primary">Créer un compte</a>
          </p>
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
        this.errorMessage = 'Email ou mot de passe incorrect';
      }
    });
  }

  continueAsGuest(): void {
    this.router.navigate(['/gallery']);
  }
}
