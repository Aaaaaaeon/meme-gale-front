import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../interfaces/notification.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Bell Button -->
      <button (click)="toggleDropdown()" 
              class="relative p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-50">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        
        <!-- Badge -->
        @if (unreadCount$ | async; as count) {
          @if (count > 0) {
            <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
              {{ count > 9 ? '9+' : count }}
            </span>
          }
        }
      </button>

      <!-- Dropdown -->
      @if (isOpen) {
        <div class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[100] animate-fade-in">
          <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="font-semibold text-gray-900">Notifications</h3>
            <button (click)="markAllRead()" class="text-xs text-primary hover:underline">
              Tout lire
            </button>
          </div>

          <div class="max-h-80 overflow-y-auto">
            @if (notifications$ | async; as notifications) {
              @if (notifications.length === 0) {
                <div class="p-6 text-center text-gray-500 text-sm">
                  Aucune notification
                </div>
              } @else {
                @for (notif of notifications; track notif.id) {
                  <div (click)="markAsRead(notif)"
                       class="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                       [class.bg-blue-50]="!notif.is_read">
                    <p class="text-sm text-gray-800" [class.font-semibold]="!notif.is_read">
                      {{ notif.message }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ notif.date_created | date:'medium' }}
                    </p>
                  </div>
                }
              }
            }
          </div>
        </div>
        
        <!-- Backdrop to close -->
        <div class="fixed inset-0 z-[90]" (click)="isOpen = false"></div>
      }
    </div>
  `
})
export class NotificationBellComponent implements OnInit {
  isOpen = false;
  unreadCount$: Observable<number>;
  notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.unreadCount$ = this.notificationService.unreadCount$;
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {
    // Initial fetch handled by service
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notificationService.refreshNotifications();
    }
  }

  markAsRead(notif: Notification): void {
    if (!notif.is_read) {
      this.notificationService.markAsRead(notif.id).subscribe();
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }
}
