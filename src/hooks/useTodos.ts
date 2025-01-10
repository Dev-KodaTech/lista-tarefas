import { useState, useCallback, useMemo } from 'react';
import { Todo } from '@/components/todo/types';
import { useToast } from '@/components/ui/use-toast';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { toast } = useToast();

  const { activeTodos, completedTodos, overdueTodos } = useMemo(() => {
    const active = todos.filter((todo) => !todo.completed);
    const completed = todos.filter((todo) => todo.completed);
    const overdue = todos.filter((todo) => {
      if (!todo.date) return false;
      
      const now = new Date();
      const todoDateTime = new Date(todo.date);
      
      if (todo.time) {
        const [hours, minutes] = todo.time.split(':');
        todoDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }
      
      return !todo.completed && todoDateTime < now;
    });

    return { activeTodos: active, completedTodos: completed, overdueTodos: overdue };
  }, [todos]);

  const addTodo = useCallback((text: string, category: string) => {
    setTodos(prev => [
      ...prev,
      {
        id: Date.now(),
        text,
        completed: false,
        category,
      },
    ]);
    toast({
      description: "Tarefa adicionada com sucesso!",
    });
  }, [toast]);

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev => 
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter((todo) => todo.id !== id));
    toast({
      variant: "destructive",
      description: "Tarefa removida!",
    });
  }, [toast]);

  const editTodo = useCallback((
    id: number,
    text: string,
    date?: Date,
    time?: string,
    category?: string,
    note?: string,
    repeat?: "daily" | "weekly" | "monthly" | null
  ) => {
    setTodos(prev =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              text,
              date,
              time,
              category: category || todo.category,
              note,
              repeat,
            } as Todo
          : todo
      )
    );
    toast({
      description: "Tarefa atualizada com sucesso!",
    });
  }, [toast]);

  return {
    todos,
    activeTodos,
    completedTodos,
    overdueTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
}; 