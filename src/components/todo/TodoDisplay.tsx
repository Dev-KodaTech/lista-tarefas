import React from "react";
import { Calendar, Clock, Trash2, Pencil, MessageSquare, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Todo } from "./types";
import { getCategoryColor } from "./utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TodoDisplayProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: () => void;
  onToggleNote: () => void;
}

const TodoDisplay = ({ todo, onToggle, onDelete, onEdit, onToggleNote }: TodoDisplayProps) => {
  const isMobile = useIsMobile();

  const ActionButtons = () => {
    if (isMobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800">
            <DropdownMenuItem onClick={onToggleNote} className="text-blue-500 hover:text-blue-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Adicionar nota
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="text-blue-500 hover:text-blue-600">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(todo.id)} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex gap-2 transition-opacity duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleNote}
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-100/50"
          title="Adicionar nota"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-100/50"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id)}
          className="text-red-500 hover:text-red-600 hover:bg-red-100/50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-3 group">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-1 transition-all duration-300"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-gray-900 dark:text-gray-100 text-lg transition-all duration-300 ${
              todo.completed ? "line-through text-gray-500 dark:text-gray-400" : ""
            }`}
          >
            {todo.text}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
              todo.category
            )}`}
          >
            {todo.category}
          </span>
        </div>
        {(todo.date || todo.time) && (
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-2">
            {todo.date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(todo.date, "PPP", { locale: ptBR })}
              </span>
            )}
            {todo.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {todo.time}
              </span>
            )}
          </span>
        )}
        {todo.note && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            {todo.note}
          </p>
        )}
      </div>
      <ActionButtons />
    </div>
  );
};

export default TodoDisplay;