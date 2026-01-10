import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DirectusService } from './directus-service';
import { Meme, CreateMemeDto, LikeResponse, LikeStatus } from '../interfaces/meme.interface';
import { Tag } from '../interfaces/tag.interface';
import { ApiResponse, ApiListResponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private likeManagerUrl = environment.likeManagerUrl;
  private searchUrl = environment.searchUrl;

  constructor(
    private directus: DirectusService,
    private http: HttpClient
  ) {}

  /**
   * Récupérer tous les memes
   */
  getMemes(params?: {
    limit?: number;
    offset?: number;
    filter?: any;
    sort?: string;
  }): Observable<Meme[]> {
    const queryParams: any = {
      fields: '*,user_created.*,tags.tags_id.*',
      ...params
    };

    return this.directus.get<Meme>('memes', queryParams).pipe(
      map(response => response.data)
    );
  }

  /**
   * Récupérer un meme par ID
   */
  getMemeById(id: string): Observable<Meme> {
    const params = {
      fields: '*,user_created.*,tags.tags_id.*'
    };

    return this.directus.getById<Meme>('memes', id, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Créer un nouveau meme
   */
  createMeme(meme: CreateMemeDto): Observable<Meme> {
    return this.directus.create<Meme>('memes', meme).pipe(
      map(response => response.data)
    );
  }

  /**
   * Mettre à jour un meme
   */
  updateMeme(id: string, meme: Partial<CreateMemeDto>): Observable<Meme> {
    return this.directus.update<Meme>('memes', id, meme).pipe(
      map(response => response.data)
    );
  }

  /**
   * Supprimer un meme
   */
  deleteMeme(id: string): Observable<void> {
    return this.directus.delete('memes', id);
  }

  /**
   * Incrémenter les vues d'un meme
   */
  incrementViews(id: string, currentViews: number): Observable<Meme> {
    return this.directus.update<Meme>('memes', id, { views: currentViews + 1 }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Toggle un like (utilise l'extension like-manager du backend)
   */
  toggleLike(memeId: string): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.likeManagerUrl}/toggle`, { 
      meme_id: memeId 
    });
  }

  /**
   * Obtenir le statut d'un like
   */
  getLikeStatus(memeId: string): Observable<LikeStatus> {
    return this.http.get<LikeStatus>(`${this.likeManagerUrl}/status/${memeId}`);
  }

  /**
   * Récupérer tous les tags
   */
  getTags(): Observable<Tag[]> {
    return this.directus.get<Tag>('tags').pipe(
      map(response => response.data)
    );
  }

  /**
   * Rechercher des memes (utilise Meilisearch)
   */
  searchMemes(query: string, options?: {
    tags?: string[];
    limit?: number;
    offset?: number;
    sort?: string;
  }): Observable<any> {
    const params: any = { q: query };
    if (options?.tags) params.tags = options.tags.join(',');
    if (options?.limit) params.limit = options.limit;
    if (options?.offset) params.offset = options.offset;
    if (options?.sort) params.sort = options.sort;

    return this.http.get(`${this.searchUrl}/memes`, { params });
  }

  /**
   * Autocomplétion de recherche
   */
  suggest(query: string, limit = 5): Observable<any> {
    return this.http.get(`${this.searchUrl}/memes/suggest`, {
      params: { q: query, limit: limit.toString() }
    });
  }

  /**
   * Upload d'une image
   */
  uploadImage(file: File): Observable<string> {
    return this.directus.uploadFile(file).pipe(
      map(response => response.data.id)
    );
  }

  /**
   * Obtenir l'URL d'une image
   */
  getImageUrl(fileId: string, width = 600, quality = 85): string {
    return this.directus.getAssetUrl(fileId, { width, quality, format: 'webp' });
  }
}
