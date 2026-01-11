import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiListResponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class DirectusService {
  private apiUrl = environment.directusApiUrl;
  private assetsUrl = environment.directusAssetsUrl;
  private filesUrl = environment.directusFilesUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request générique
   */
  get<T>(collection: string, params?: any): Observable<ApiListResponse<T>> {
    const url = `${this.apiUrl}/${collection}`;
    const serializedParams = this.serializeParams(params);
    return this.http.get<ApiListResponse<T>>(url, { params: serializedParams });
  }

  private serializeParams(params: any): any {
    if (!params) return {};
    const result: any = {};
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (key === 'filter' && typeof value === 'object') {
        this.flattenFilter(value, result, 'filter');
      } else {
        result[key] = value;
      }
    });
    
    return result;
  }

  private flattenFilter(obj: any, result: any, prefix: string) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = `${prefix}[${key}]`;
      
      if (typeof value === 'object' && value !== null) {
        this.flattenFilter(value, result, newKey);
      } else {
        result[newKey] = value;
      }
    });
  }

  /**
   * GET by ID
   */
  getById<T>(collection: string, id: string, params?: any): Observable<ApiResponse<T>> {
    const url = `${this.apiUrl}/${collection}/${id}`;
    return this.http.get<ApiResponse<T>>(url, { params });
  }

  /**
   * POST - Create
   */
  create<T>(collection: string, data: any): Observable<ApiResponse<T>> {
    const url = `${this.apiUrl}/${collection}`;
    return this.http.post<ApiResponse<T>>(url, data);
  }

  /**
   * PATCH - Update
   */
  update<T>(collection: string, id: string, data: any): Observable<ApiResponse<T>> {
    const url = `${this.apiUrl}/${collection}/${id}`;
    return this.http.patch<ApiResponse<T>>(url, data);
  }

  /**
   * DELETE
   */
  delete(collection: string, id: string): Observable<void> {
    const url = `${this.apiUrl}/${collection}/${id}`;
    return this.http.delete<void>(url);
  }

  /**
   * Upload de fichier
   */
  uploadFile(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(this.filesUrl, formData);
  }

  /**
   * Obtenir l'URL d'un asset avec transformations
   */
  getAssetUrl(fileId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: string;
    format?: string;
  }): string {
    if (!fileId) return '';

    const params = new URLSearchParams();
    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.quality) params.append('quality', options.quality.toString());
    if (options?.fit) params.append('fit', options.fit);
    if (options?.format) params.append('format', options.format);

    const queryString = params.toString();
    return `${this.assetsUrl}/${fileId}${queryString ? '?' + queryString : ''}`;
  }
}
