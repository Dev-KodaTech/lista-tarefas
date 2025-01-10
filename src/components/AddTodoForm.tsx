import React, { useState } from "react";
import { Plus, Briefcase, User, GraduationCap, ShoppingCart, Tag, ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AddTodoFormProps {
  onAdd: (text: string, category: string) => void;
}

const AddTodoForm = ({ onAdd }: AddTodoFormProps) => {
  const [newTodo, setNewTodo] = useState("");
  const [category, setCategory] = useState("pessoal");
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo.trim(), category);
      setNewTodo("");
    }
  };

  const categories = [
    { value: "pessoal", label: "Pessoal", icon: <User className="h-4 w-4" /> },
    { value: "trabalho", label: "Trabalho", icon: <Briefcase className="h-4 w-4" /> },
    { value: "estudos", label: "Estudos", icon: <GraduationCap className="h-4 w-4" /> },
    { value: "compras", label: "Compras", icon: <ShoppingCart className="h-4 w-4" /> },
    { value: "outros", label: "Outros", icon: <Tag className="h-4 w-4" /> },
  ];

  const selectedCategory = categories.find((cat) => cat.value === category);

  const CategorySelector = () => {
    if (isMobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-sm hover:bg-white/80 dark:hover:bg-gray-700/80"
            >
              <div className="flex items-center gap-2">
                {selectedCategory?.icon}
                {selectedCategory?.label}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-[200px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            {categories.map((cat) => (
              <DropdownMenuItem
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-700/50"
              >
                {cat.icon}
                {cat.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            type="button"
            variant={category === cat.value ? "default" : "outline"}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-2 transition-all duration-300 ${
              category === cat.value
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                : "hover:bg-blue-50 dark:hover:bg-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0"
            }`}
          >
            {cat.icon}
            {cat.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Adicionar nova tarefa..."
          className="flex-1 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
        />
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300 shadow-md"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <CategorySelector />
    </form>
  );
};

export default AddTodoForm;