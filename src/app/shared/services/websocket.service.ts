import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
  type: string;
  action?: string;
  collection?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  
  private messageSubject = new Subject<WebSocketMessage>();
  public messages$ = this.messageSubject.asObservable();
  
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {}

  /**
   * Connect to Directus WebSocket
   */
  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('WebSocket: No auth token, skipping connection');
      return;
    }

    // Directus WebSocket URL
    const wsUrl = environment.directusUrl.replace('http', 'ws') + '/websocket';
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        this.connectionStatusSubject.next(true);
        this.reconnectAttempts = 0;
        
        // Authenticate with Directus
        this.send({
          type: 'auth',
          access_token: token
        });
        
        // Subscribe to notifications collection
        this.send({
          type: 'subscribe',
          collection: 'notifications',
          query: {
            fields: ['*']
          }
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      this.socket.onclose = (event) => {
        this.connectionStatusSubject.next(false);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  /**
   * Send message through WebSocket
   */
  private send(message: object): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('WebSocket: Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
