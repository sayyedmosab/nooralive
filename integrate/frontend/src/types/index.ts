export type Language = 'en' | 'ar';

export interface Episode {
  type: 'article' | 'video' | 'podcast' | 'guide';
  title: string;
  description: string;
  duration?: string;
}

export interface Chapter {
  id: number;
  title: string;
  episodes: Episode[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
