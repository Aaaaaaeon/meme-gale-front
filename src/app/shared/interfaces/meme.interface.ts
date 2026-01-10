import { Tag } from './tag.interface';
import { User } from './user.interface';

export interface Meme {
  id: string;
  title: string;
  image: string; // UUID du fichier
  status: 'draft' | 'published';
  views: number;
  likes: number;
  tags?: MemeTag[];
  user_created: User | string;
  date_created: string;
  date_updated: string;
}

export interface MemeTag {
  id: number;
  memes_id: string;
  tags_id: Tag;
}

export interface CreateMemeDto {
  title: string;
  image: string;
  status: 'draft' | 'published';
  tags?: { tags_id: string }[];
}

export interface LikeResponse {
  success: boolean;
  meme_id: string;
  liked: boolean;
  totalLikes: number;
  message: string;
}

export interface LikeStatus {
  meme_id: string;
  liked: boolean;
  totalLikes: number;
}
