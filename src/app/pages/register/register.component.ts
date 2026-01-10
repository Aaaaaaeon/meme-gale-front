import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-full max-w-md bg-base-100 shadow-2xl">
        <div class="card-body">
          <h2 class="card-title text-3xl font-bold text-center mb-6">Créer un compte</h2>
          <p class="text-center opacity-70 mb-4">Rejoignez la communauté !</p>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input type="email" 
                     formControlName="email"
                     placeholder="votre@email.com" 
                     class="input input-bordered" 
                     [class.input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" />
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <label class="label">
                  <span class="label-text-alt text-error">Email invalide</span>
                </label>
              }
            </div>

            <!-- First Name -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">Prénom</span>
              </label>
              <input type="text" 
                     formControlName="first_name"
                     placeholder="Jean" 
                     class="input input-bordered" />
            </div>

            <!-- Last Name -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">Nom</span>
              </label>
              <input type="text" 
                     formControlName="last_name"
                     placeholder="Dupont" 
                     class="input input-bordered" />
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
                     [class.input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" />
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <label class="label">
                  <span class="label-text-alt text-error">8 caractères minimum</span>
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
                      [disabled]="registerForm.invalid || loading"
                      [class.loading]="loading">
                @if (loading) {
                  <span class="loading loading-spinner"></span>
                } @else {
                  <span>Créer mon compte</span>
                }
              </button>
            </div>
          </form>

          <!-- Login Link -->
          <div class="divider">OU</div>
          <p class="text-center">
            Déjà un compte ? 
            <a routerLink="/login" class="link link-primary">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      first_name: [''],
      last_name: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const userData = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      first_name: this.registerForm.value.first_name,
      last_name: this.registerForm.value.last_name,
      role: '476218a4-c16c-4137-9a25-37e63f653f4c', // UUID du rôle Authenticated User
      status: 'active'
    };
    
    // Directus users endpoint
    this.http.post(`${environment.directusUrl}/users`, userData).subscribe({
      next: () => {
        // Redirect to login after successful registration
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.errors?.[0]?.message || 'Erreur lors de la création du compte';
        console.error('Registration error:', error);
      }
    });
  }
}
