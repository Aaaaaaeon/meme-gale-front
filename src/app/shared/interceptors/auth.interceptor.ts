import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// Eviter l'injection de AuthService ici pour éviter les dépendances circulaires
// AuthService -> HttpClient -> AuthInterceptor -> AuthService

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  // Ne pas ajouter le token pour les endpoints d'authentification
  const isAuthEndpoint = req.url.includes('/auth/login') || 
                         req.url.includes('/auth/register') || 
                         req.url.includes('/auth/refresh') ||
                         req.url.includes('/assets/');

  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
