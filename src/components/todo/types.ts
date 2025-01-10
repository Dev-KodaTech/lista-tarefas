export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date?: Date;
  time?: string;
  category: string;
  note?: string;
  repeat?: 'daily' | 'weekly' | 'monthly' | null;
}