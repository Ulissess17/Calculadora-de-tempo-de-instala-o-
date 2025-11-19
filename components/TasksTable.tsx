import React from 'react';
import type { Task } from '../types';

interface TasksTableProps {
  tasks: Task[];
  onTaskChange: (id: string, field: keyof Task, value: string | number) => void;
}

const TasksTable: React.FC<TasksTableProps> = ({ tasks, onTaskChange }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Atividade
            </th>
            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              HH/Ponto
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                <input 
                  type="text" 
                  value={task.name}
                  onChange={(e) => onTaskChange(task.id, 'name', e.target.value)}
                  className="block w-full font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={task.phase}
                  onChange={(e) => onTaskChange(task.id, 'phase', e.target.value)}
                  className="block w-full text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none mt-1"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                <input
                  type="number"
                  step="0.1"
                  value={task.manHoursPerPoint}
                  onChange={(e) => onTaskChange(task.id, 'manHoursPerPoint', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-20 text-right p-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TasksTable;