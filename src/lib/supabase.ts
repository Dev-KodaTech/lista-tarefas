import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key são necessários.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string;
          text: string;
          completed: boolean;
          date: string | null;
          time: string | null;
          category: string;
          note: string | null;
          repeat: 'daily' | 'weekly' | 'monthly' | null;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['todos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['todos']['Insert']>;
      };
      categories: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          color: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      task_attachments: {
        Row: {
          id: number;
          created_at: string;
          todo_id: number;
          file_path: string;
          file_name: string;
          file_size: number;
          file_type: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['task_attachments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['task_attachments']['Insert']>;
      };
    };
  };
}; 