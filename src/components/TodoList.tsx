import React, { useCallback } from "react";
import TodoCard from "./TodoCard";
import AddTodoForm from "./AddTodoForm";
import { Todo } from "./todo/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTodos } from "@/hooks/useTodos";

const TodoList = () => {
  const isMobile = useIsMobile();
  const {
    activeTodos,
    completedTodos,
    overdueTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  } = useTodos();

  // Memoize render items
  const renderTodoList = useCallback((todos: Todo[]) => {
    return todos.map((todo, index) => (
      <div 
        key={todo.id} 
        className="transform transition-all duration-300" 
        style={{ 
          animationDelay: `${Math.min(index * 50, 300)}ms`,
          opacity: 0,
          animation: 'fadeSlideIn 0.3s ease forwards'
        }}
      >
        <TodoCard
          todo={todo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
        />
      </div>
    ));
  }, [toggleTodo, deleteTodo, editTodo]);

  // Memoize empty states
  const EmptyState = useCallback(({ title, description, icon }: { title: string; description: string; icon: JSX.Element }) => (
    <div className="text-center text-gray-500 dark:text-gray-400 mt-8 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="relative w-16 h-16 mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
        {title}
      </h3>
      <p className="text-base text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-[#2564cf] dark:bg-gray-900 p-4 sm:p-8">
      <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-3xl'}`}>
        <div className="relative mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Lista de Tarefas
          </h1>
          <p className="text-white/90 text-sm">
            Organize suas tarefas de forma simples e eficiente
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <AddTodoForm onAdd={addTodo} />
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl backdrop-blur-lg p-1 gap-1 sticky top-4 z-50 shadow-lg mb-6 bg-white/95 dark:bg-gray-800/95">
            <TabsTrigger 
              value="active" 
              className="relative rounded-lg data-[state=active]:bg-[#2564cf] data-[state=active]:text-white text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 overflow-hidden group"
            >
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <div className="relative flex-shrink-0">
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-data-[state=active]:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Ativas ({activeTodos.length})</span>
              </div>
            </TabsTrigger>

            <TabsTrigger 
              value="overdue" 
              className="relative rounded-lg data-[state=active]:bg-[#d83b01] data-[state=active]:text-white text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 overflow-hidden group"
            >
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <div className="relative flex-shrink-0">
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-data-[state=active]:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Vencidas ({overdueTodos.length})</span>
              </div>
            </TabsTrigger>

            <TabsTrigger 
              value="completed" 
              className="relative rounded-lg data-[state=active]:bg-[#107c10] data-[state=active]:text-white text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 overflow-hidden group"
            >
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <div className="relative flex-shrink-0">
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-data-[state=active]:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Concluídas ({completedTodos.length})</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <TabsContent value="active" className="space-y-3 mt-4">
              {renderTodoList(activeTodos)}
              {activeTodos.length === 0 && (
                <EmptyState
                  title="Nenhuma tarefa ativa"
                  description="Comece adicionando uma nova tarefa!"
                  icon={
                    <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 rounded-full blur-xl" />
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-3 mt-4">
              {renderTodoList(overdueTodos)}
              {overdueTodos.length === 0 && (
                <EmptyState
                  title="Nenhuma tarefa vencida"
                  description="Você está em dia com suas tarefas!"
                  icon={
                    <div className="absolute inset-0 bg-green-500/20 dark:bg-green-400/10 rounded-full blur-xl" />
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {renderTodoList(completedTodos)}
              {completedTodos.length === 0 && (
                <EmptyState
                  title="Nenhuma tarefa concluída"
                  description="Complete algumas tarefas para vê-las aqui!"
                  icon={
                    <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/10 rounded-full blur-xl" />
                  }
                />
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="h-12 sm:h-16" />
      </div>
    </div>
  );
};

export default React.memo(TodoList);
