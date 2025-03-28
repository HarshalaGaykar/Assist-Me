import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Clock, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { AddTodo } from './AddTodo';

export const TodoList: React.FC = () => {
  const { todos, toggleTodo, removeTodo } = useStore();

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <AddTodo />
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <button onClick={() => toggleTodo(todo.id)}>
                {todo.completed ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <Circle className="text-gray-400" />
                )}
              </button>
              <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                {todo.text}
              </span>
              {todo.reminder && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {format(todo.reminder, 'PPp')}
                </div>
              )}
            </div>
            <button
              onClick={() => removeTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
};