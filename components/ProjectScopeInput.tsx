import React from 'react';
import type { ProjectInputs } from '../types';

interface ProjectScopeInputProps {
  inputs: Omit<ProjectInputs, 'workFronts'>;
  onInputChange: (field: keyof Omit<ProjectInputs, 'workFronts'>, value: number) => void;
}

const InputField: React.FC<{
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    step?: number;
}> = ({ label, value, onChange, step=1 }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="number"
            value={value}
            onChange={onChange}
            step={step}
            min="0"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);


const ProjectScopeInput: React.FC<ProjectScopeInputProps> = ({ inputs, onInputChange }) => {
  
  const handleValueChange = (field: keyof Omit<ProjectInputs, 'workFronts'>, value: string) => {
    const parsedValue = parseFloat(value);
    // Ensure that NaN values from invalid input (e.g., empty string, text) default to 0.
    // Also, prevent negative numbers.
    onInputChange(field, isNaN(parsedValue) ? 0 : Math.max(0, parsedValue));
  };

  return (
    <div className="space-y-4">
      <InputField
        label="Total de Pontos de Instalação"
        value={inputs.totalPoints}
        onChange={(e) => handleValueChange('totalPoints', e.target.value)}
      />
      <InputField
        label="Horas de Trabalho por Dia"
        value={inputs.workHoursPerDay}
        onChange={(e) => handleValueChange('workHoursPerDay', e.target.value)}
      />
      <InputField
        label="Pessoas por Célula de Trabalho"
        value={inputs.peoplePerCell}
        onChange={(e) => handleValueChange('peoplePerCell', e.target.value)}
      />
    </div>
  );
};

export default ProjectScopeInput;