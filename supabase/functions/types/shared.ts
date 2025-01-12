export interface PaginationParams {
  page?: number;
  limit?: number;
  order?: string;
  direction?: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  category?: string;
  status?: 'completed' | 'pending';
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  todayCount: number;
  upcomingCount: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete';
  items: T[];
}

export interface NotificationPreferences {
  overdueReminders: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface TodoWithRelations {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  date?: string;
  priority: 'low' | 'medium' | 'high';
  category_id?: number;
  user_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  attachments?: {
    id: number;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
  }[];
} 