import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginCredentials } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = environment.directusAuthUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Charger l'utilisateur depuis le localStorage au démarrage
    this.loadUserFromStorage();
  }

  /**
   * Login
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.authUrl}/login`, 
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      .pipe(
        tap((response) => {
          this.setSession(response);
        })
      );
  }

  /**
   * Logout
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<void>(`${this.authUrl}/logout`, { refresh_token: refreshToken }).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${this.authUrl}/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((response) => {
          this.setSession(response);
        })
      );
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  /**
   * Obtenir le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtenir le refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Sauvegarder la session
   */
  /**
   * Sauvegarder la session
   */
  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem('access_token', authResponse.data.access_token);
    localStorage.setItem('refresh_token', authResponse.data.refresh_token);
    localStorage.setItem('expires', authResponse.data.expires.toString());
    
    // Récupérer les infos de l'utilisateur
    this.fetchCurrentUser().subscribe();
  }

  /**
   * Récupérer l'utilisateur courant depuis l'API
   */
  /**
   * Récupérer l'utilisateur courant depuis l'API
   */
  fetchCurrentUser(): Observable<User> {
    return this.http.get<{ data: User }>(`${environment.directusUrl}/users/me`).pipe(
      tap(response => {
        const user = response.data;
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      map(response => response.data)
    );
  }

  /**
   * Mettre à jour l'utilisateur courant
   */
  updateUser(data: Partial<User>): Observable<User> {
    return this.http.patch<{ data: User }>(`${environment.directusUrl}/users/me`, data).pipe(
      map(response => {
        const updatedUser = response.data;
        // Update local storage and subject
        const currentUser = this.currentUserSubject.value;
        const mergedUser = { ...currentUser, ...updatedUser }; // Merge to keep other fields if partial response
        
        localStorage.setItem('current_user', JSON.stringify(mergedUser));
        this.currentUserSubject.next(mergedUser);
        return mergedUser;
      })
    );
  }

  /**
   * Nettoyer la session
   */
  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  /**
   * Charger l'utilisateur depuis le localStorage
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from storage', e);
        localStorage.removeItem('current_user');
      }
    }

    // Toujours rafraîchir les données utilisateur si on a un token
    // Cela corrige les cas où les données locales sont incomplètes ou périmées
    if (this.getAccessToken()) {
      this.fetchCurrentUser().subscribe({
        error: (err) => {
          console.error('AuthService: Failed to refresh user', err);
          // Si on n'avait pas de user en cache et que le fetch échoue, on déconnecte
          if (!this.currentUserSubject.value) {
            this.logout();
          }
        }
      });
    }
  }
}
