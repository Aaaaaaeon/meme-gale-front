import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
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
   * Toggle un like (logique manuelle car l'endpoint est cassé)
   */
  toggleLike(memeId: string): Observable<LikeResponse> {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    const userId = currentUser.id;
    if (!userId) {
      throw new Error('User not connected');
    }

    // 1. Check if like exists
    return this.directus.get<any>('meme_likes', {
      filter: {
        user_id: { _eq: userId },
        meme_id: { _eq: memeId }
      }
    }).pipe(
      switchMap(response => {
        const existingLike = response.data[0];
        
        if (existingLike) {
          // UNLIKE
          return this.directus.delete('meme_likes', existingLike.id).pipe(
            switchMap(() => this.getMemeById(memeId)), // Get current likes
            switchMap(meme => {
              const newCount = Math.max(0, (meme.likes || 0) - 1);
              return this.directus.update<Meme>('memes', memeId, { likes: newCount });
            }),
            map(meme => ({
              success: true,
              meme_id: memeId,
              liked: false,
              totalLikes: meme.data.likes,
              message: 'Like supprimé'
            }))
          );
        } else {
          // LIKE
          return this.directus.create('meme_likes', {
            user_id: userId,
            meme_id: memeId
          }).pipe(
            switchMap(() => this.getMemeById(memeId)),
            switchMap(meme => {
              const newCount = (meme.likes || 0) + 1;
              return this.directus.update<Meme>('memes', memeId, { likes: newCount }).pipe(
                map(updatedMeme => ({ meme, updatedMeme }))
              );
            }),
            switchMap(({ meme, updatedMeme }) => {
              // Create notification for meme owner (if not self-like)
              const ownerId = typeof meme.user_created === 'object' ? meme.user_created.id : meme.user_created;
              
              if (ownerId && ownerId !== userId) {
                const likerName = currentUser.first_name 
                  ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
                  : 'Quelqu\'un';
                
                return this.directus.create('notifications', {
                  recipient: ownerId,
                  message: `${likerName} a liké votre mème "${meme.title}"`,
                  is_read: false
                }).pipe(
                  map(() => updatedMeme)
                );
              }
              return new Observable<typeof updatedMeme>(obs => {
                obs.next(updatedMeme);
                obs.complete();
              });
            }),
            map(meme => ({
              success: true,
              meme_id: memeId,
              liked: true,
              totalLikes: meme.data.likes,
              message: 'Meme liké'
            }))
          );
        }
      })
    );
  }

  /**
   * Obtenir le statut d'un like
   */
  getLikeStatus(memeId: string): Observable<LikeStatus> {
    const userId = JSON.parse(localStorage.getItem('current_user') || '{}').id;
    if (!userId) {
       return new Observable(observer => {
         observer.next({ meme_id: memeId, liked: false, totalLikes: 0 });
         observer.complete();
       });
    }

    return this.directus.get<any>('meme_likes', {
      filter: {
        user_id: { _eq: userId },
        meme_id: { _eq: memeId }
      }
    }).pipe(
      switchMap(response => {
        const isLiked = response.data.length > 0;
        return this.getMemeById(memeId).pipe(
           map(meme => ({
             meme_id: memeId,
             liked: isLiked,
             totalLikes: meme.likes || 0
           }))
        );
      })
    );
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
  getImageUrl(fileId: string | any, width?: number, quality?: number): string {
    // Si fileId est un objet (cas où Directus expand la relation), on prend l'ID
    const id = typeof fileId === 'object' && fileId?.id ? fileId.id : fileId;
    
    // On retourne l'URL sans transformation par défaut pour éviter les erreurs de génération
    // Si on veut optimiser plus tard, on pourra remettre les options
    const url = this.directus.getAssetUrl(id, !width && !quality ? undefined : { width, quality });
    return url;
  }
}
