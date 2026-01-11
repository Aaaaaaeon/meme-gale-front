import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p class="text-gray-600">Rejoignez la communauté MemeGale</p>
        </div>

        <!-- Register Form -->
        <div class="card-custom p-8">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" 
                     formControlName="email"
                     placeholder="vous@exemple.com" 
                     class="input-custom"
                     [class.input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" />
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <p class="text-sm text-red-600 mt-1">Email valide requis</p>
              }
            </div>

            <!-- First Name -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input type="text" 
                     formControlName="first_name"
                     placeholder="Jean" 
                     class="input-custom" />
            </div>

            <!-- Last Name -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input type="text" 
                     formControlName="last_name"
                     placeholder="Dupont" 
                     class="input-custom" />
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input type="password" 
                     formControlName="password"
                     placeholder="••••••••" 
                     class="input-custom"
                     [class.input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" />
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <p class="text-sm text-red-600 mt-1">8 caractères minimum</p>
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
                    class="btn-custom btn-primary w-full mb-6"
                    [disabled]="registerForm.invalid || loading">
              @if (loading) {
                <div class="spinner w-4 h-4"></div>
                Inscription...
              } @else {
                S'inscrire
              }
            </button>

            <!-- Login Link -->
            <p class="text-center text-sm text-gray-600">
              Déjà un compte ? 
              <a routerLink="/login" class="font-medium text-primary hover:text-primary-dark ml-1">Se connecter</a>
            </p>
          </form>
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
      role: '476218a4-c16c-4137-9a25-37e63f653f4c',
      status: 'active'
    };
    
    this.http.post(`${environment.directusUrl}/users`, userData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.errors?.[0]?.message || 'Erreur lors de la création du compte';
      }
    });
  }
}
