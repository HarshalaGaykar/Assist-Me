import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useStore } from '../store';

export const AddTodo: React.FC = () => {
  const [text, setText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const { addTodo } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let reminder: Date | undefined;
    if (reminderDate && reminderTime) {
      reminder = new Date(`${reminderDate}T${reminderTime}`);
    }

    addTodo(text, reminder);
    setText('');
    setReminderDate('');
    setReminderTime('');
    setShowDatePicker(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="p-2 text-gray-600 hover:text-blue-500"
        >
          <Calendar className="w-6 h-6" />
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      {showDatePicker && (
        <div className="flex gap-2 mb-2">
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          />
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          />
        </div>
      )}
    </form>
  );
};