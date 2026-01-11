export interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  date_created: string;
  recipient?: string;
  user_created?: string;
}
