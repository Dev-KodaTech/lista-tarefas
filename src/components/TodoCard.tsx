import React, { useState, useRef } from "react";
import TodoDisplay from "./todo/TodoDisplay";
import TodoEdit from "./todo/TodoEdit";
import { Todo } from "./todo/types";

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string, date?: Date, time?: string, category?: string, note?: string, repeat?: string | null) => void;
}

const TodoCard = ({ todo, onToggle, onDelete, onEdit }: TodoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(todo.date);
  const [selectedTime, setSelectedTime] = useState(todo.time || "");
  const [selectedCategory, setSelectedCategory] = useState(todo.category);
  const [note, setNote] = useState(todo.note || "");
  const [repeat, setRepeat] = useState<string | null>(todo.repeat || null);
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText, selectedDate, selectedTime, selectedCategory, note, repeat);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(todo.text);
    setSelectedDate(todo.date);
    setSelectedTime(todo.time || "");
    setSelectedCategory(todo.category);
    setNote(todo.note || "");
    setRepeat(todo.repeat || null);
  };

  const handleToggleNote = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
    setIsNoteVisible(!isNoteVisible);
    setTimeout(() => {
      noteRef.current?.focus();
    }, 0);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 backdrop-blur-lg rounded-xl p-4 shadow-lg transition-transform duration-300 hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#2564cf]/5 dark:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        {isEditing ? (
          <TodoEdit
            editText={editText}
            setEditText={setEditText}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            note={note}
            setNote={setNote}
            repeat={repeat}
            setRepeat={setRepeat}
            onSave={handleSave}
            onCancel={handleCancel}
            noteRef={noteRef}
          />
        ) : (
          <TodoDisplay
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={() => setIsEditing(true)}
            onToggleNote={handleToggleNote}
          />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gray-100 dark:bg-gray-700" />
    </div>
  );
};

export default TodoCard;