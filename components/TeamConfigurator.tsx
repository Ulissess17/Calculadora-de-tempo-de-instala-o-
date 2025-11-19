
import React from 'react';
import type { WorkFront } from '../types';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface TeamConfiguratorProps {
  workFronts: WorkFront[];
  onWorkFrontsChange: (workFronts: WorkFront[]) => void;
}

const TeamConfigurator: React.FC<TeamConfiguratorProps> = ({ workFronts, onWorkFrontsChange }) => {

  const handleCellChange = (id: string, change: number) => {
    const updatedFronts = workFronts.map(wf => {
      if (wf.id === id) {
        return { ...wf, allocatedCells: Math.max(0, wf.allocatedCells + change) };
      }
      return wf;
    });
    onWorkFrontsChange(updatedFronts);
  };

  const handleNameChange = (id: string, newName: string) => {
    const updatedFronts = workFronts.map(wf => {
      if (wf.id === id) {
        return { ...wf, name: newName };
      }
      return wf;
    });
    onWorkFrontsChange(updatedFronts);
  };
  
  const totalCells = workFronts.reduce((sum, wf) => sum + wf.allocatedCells, 0);

  return (
    <div className="space-y-3">
      {workFronts.map(wf => (
        <div key={wf.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <input 
            type="text" 
            value={wf.name} 
            onChange={(e) => handleNameChange(wf.id, e.target.value)}
            className="text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full mr-3 px-1"
          />
          <div className="flex items-center space-x-2 shrink-0">
            <button onClick={() => handleCellChange(wf.id, -1)} className="text-gray-500 hover:text-red-600 disabled:opacity-50" disabled={wf.allocatedCells <= 0}>
              <MinusCircle size={20} />
            </button>
            <span className="text-sm font-semibold w-6 text-center">{wf.allocatedCells}</span>
            <button onClick={() => handleCellChange(wf.id, 1)} className="text-gray-500 hover:text-green-600">
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
      ))}
      <div className="pt-2 border-t mt-3 flex justify-between font-bold text-gray-800">
          <span>Total de Células</span>
          <span>{totalCells}</span>
      </div>
    </div>
  );
};

export default TeamConfigurator;
