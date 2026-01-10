import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">Mon Profil</h1>

      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Profile en cours de développement</h2>
          <p>Cette page affichera vos informations et vos memes.</p>
          <div class="card-actions justify-end mt-4">
            <a routerLink="/gallery" class="btn btn-primary">Retour à la galerie</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {}
