import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/gallery',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/meme-galery/meme-galery.component').then(m => m.MemeGaleryComponent)
  },
  {
    path: 'meme/:id',
    loadComponent: () => import('./pages/meme-detail/meme-detail.component').then(m => m.MemeDetailComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/create-meme/create-meme.component').then(m => m.CreateMemeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  }
];
