import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, switchMap, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DirectusService } from './directus-service';
import { Notification } from '../interfaces/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private directus: DirectusService,
    private http: HttpClient
  ) {
    this.refreshNotifications();
    
    // Poll every minute
    timer(60000, 60000).subscribe(() => this.refreshNotifications());
  }

  refreshNotifications(): void {
    if (!localStorage.getItem('access_token')) return;

    this.directus.get<Notification>('notifications', {
      sort: '-date_created',
      limit: 20
    }).subscribe({
      next: (response) => {
        const notifications = response.data;
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  markAsRead(id: string): Observable<void> {
    return this.directus.update<Notification>('notifications', id, { is_read: true }).pipe(
      map(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => n.id === id ? { ...n, is_read: true } : n);
        this.notificationsSubject.next(updated);
        this.updateUnreadCount(updated);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    const unread = this.notificationsSubject.value.filter(n => !n.is_read);
    const ids = unread.map(n => n.id);
    
    if (ids.length === 0) return new Observable(obs => { obs.next(); obs.complete(); });

    // Batch update via directus items (if supported) or loop
    // Directus supports batch update with keys
    return this.http.patch(`${environment.directusApiUrl}/notifications`, {
      keys: ids,
      data: { is_read: true }
    }).pipe(
      map(() => {
        this.refreshNotifications();
      })
    );
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const count = notifications.filter(n => !n.is_read).length;
    this.unreadCountSubject.next(count);
  }
}
