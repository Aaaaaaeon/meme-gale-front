import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Ne pas ajouter le token pour les endpoints d'authentification
  const isAuthEndpoint = req.url.includes('/auth/login') || 
                         req.url.includes('/auth/register') || 
                         req.url.includes('/auth/refresh');

  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
