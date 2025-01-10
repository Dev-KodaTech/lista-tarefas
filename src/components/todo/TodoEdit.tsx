import React from "react";
import { Check, X, Calendar as CalendarIcon, Repeat } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TodoEditProps {
  editText: string;
  setEditText: (text: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  note: string;
  setNote: (note: string) => void;
  repeat: string | null;
  setRepeat: (repeat: string | null) => void;
  onSave: () => void;
  onCancel: () => void;
  noteRef?: React.RefObject<HTMLTextAreaElement>;
}

const TodoEdit = ({
  editText,
  setEditText,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  selectedCategory,
  setSelectedCategory,
  note,
  setNote,
  repeat,
  setRepeat,
  onSave,
  onCancel,
  noteRef,
}: TodoEditProps) => {
  return (
    <div className="flex-1 space-y-3">
      <Input
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="flex-1 bg-white/50 dark:bg-gray-700/50"
        autoFocus
      />
      <div className="flex gap-2 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <div className="inline-block">
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Selecionar data</span>
                )}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-32 bg-white/50 dark:bg-gray-700/50"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-700/50">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pessoal">Pessoal</SelectItem>
            <SelectItem value="trabalho">Trabalho</SelectItem>
            <SelectItem value="estudos">Estudos</SelectItem>
            <SelectItem value="compras">Compras</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={repeat || "none"} 
          onValueChange={(value) => setRepeat(value === "none" ? null : value as "daily" | "weekly" | "monthly")}
        >
          <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-700/50">
            <SelectValue placeholder="Repetir">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <span>Repetir</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Não repetir</SelectItem>
            <SelectItem value="daily">Diariamente</SelectItem>
            <SelectItem value="weekly">Semanalmente</SelectItem>
            <SelectItem value="monthly">Mensalmente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="Adicionar anotação..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-[100px] bg-white/50 dark:bg-gray-700/50"
        ref={noteRef}
      />
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="text-green-500 hover:text-green-600 hover:bg-green-100/50"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-red-500 hover:text-red-600 hover:bg-red-100/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TodoEdit;