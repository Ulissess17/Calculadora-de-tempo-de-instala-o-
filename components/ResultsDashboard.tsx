
import React, { useMemo } from 'react';
import type { CalculationResults, TeamRole } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Zap, HardHat, Clock, Users, CalendarDays, Map } from 'lucide-react';

interface ResultsDashboardProps {
  results: CalculationResults;
  teamRoles: TeamRole[];
  onWorkFrontNameChange: (id: string, newName: string) => void;
  onTotalManHoursChange: (newTotal: number) => void;
}

// Defensive formatting function to prevent crashes from NaN or Infinity
const formatNumber = (num: number, digits: number = 0): string => {
  if (!isFinite(num)) {
    return '0'; 
  }
  return num.toFixed(digits);
};

// Colors for the new pie chart breakdown
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface SummaryCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    isEditable?: boolean;
    onValueChange?: (newValue: string) => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color, isEditable, onValueChange }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onValueChange) {
            onValueChange(e.target.value);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500">{title}</p>
                {isEditable ? (
                    <input 
                        type="number" 
                        value={value} 
                        onChange={handleInputChange}
                        className="text-xl font-bold text-gray-900 w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        step="0.01"
                    />
                ) : (
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                )}
            </div>
        </div>
    );
};

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, teamRoles, onWorkFrontNameChange, onTotalManHoursChange }) => {
  
  // Aggregate Team Roles for Pie Chart
  const pieData = useMemo(() => {
    const aggregated = teamRoles.reduce((acc, role) => {
        const hh = parseFloat(role.totalHH) || 0;
        if (hh > 0) {
            acc[role.category] = (acc[role.category] || 0) + hh;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(aggregated).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
    }));
  }, [teamRoles]);

  const totalPieValue = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const ganttData = [
      { name: 'Planejamento', start: 1, end: 4 },
      { name: 'Obras Civis', start: 2, end: 8 },
      { name: 'Instalação Técnica', start: 4, end: 10 },
      { name: 'Comissionamento', start: 6, end: 11 },
      { name: 'Encerramento', start: 10, end: 12 },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard title="Total HH de Esforço" value={formatNumber(results.totalManHours, 0)} icon={<Target className="text-white"/>} color="bg-blue-500" />
        <SummaryCard 
            title="HH/Ponto (Total)" 
            value={formatNumber(results.totalManHoursPerPoint, 2)} 
            icon={<Zap className="text-white"/>} 
            color="bg-yellow-500" 
            isEditable={true}
            onValueChange={(val) => onTotalManHoursChange(parseFloat(val) || 0)}
        />
        <SummaryCard title="Duração (Dias Úteis)" value={formatNumber(results.projectDurationDays, 1)} icon={<CalendarDays className="text-white"/>} color="bg-green-500" />
        <SummaryCard title="Produtividade/Célula" value={`${formatNumber(results.dailyProductivityPerCell, 2)} pts/dia`} icon={<Users className="text-white"/>} color="bg-indigo-500" />
        <SummaryCard title="Produtividade Total" value={`${formatNumber(results.totalDailyProductivity, 2)} pts/dia`} icon={<Clock className="text-white"/>} color="bg-purple-500" />
         <SummaryCard title="Total de Células" value={formatNumber(results.workFrontsDistribution.reduce((acc, wf) => acc + wf.allocatedCells, 0), 0)} icon={<HardHat className="text-white"/>} color="bg-pink-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-lg mb-2 text-gray-700">Distribuição de Esforço (HH)</h3>
          {totalPieValue > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value, 0)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              Nenhum dado de esforço consolidado para exibir
            </div>
          )}
        </div>
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-gray-700">Cronograma Semanal Estimado</h3>
            <div className="space-y-2 text-sm">
                {ganttData.map(item => (
                    <div key={item.name} className="flex items-center">
                        <div className="w-1/3 font-medium text-gray-600">{item.name}</div>
                        <div className="w-2/3 bg-gray-200 rounded-full h-4 relative">
                            <div 
                                className="bg-blue-500 h-4 rounded-full"
                                style={{ 
                                    marginLeft: `${((item.start - 1) / 12) * 100}%`,
                                    width: `${((item.end - item.start) / 12) * 100}%` 
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
                 <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>Sem 1</span>
                    <span>Sem 6</span>
                    <span>Sem 12</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* Work Fronts Table */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-700"><Map className="mr-2"/> Alocação de Recursos por Frente</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frente de Trabalho</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Células</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">HH Civil (Est.)</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">HH Técnico (Est.)</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">HH Total (Est.)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.workFrontsDistribution.map(wf => (
                <tr key={wf.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      <input 
                          type="text" 
                          value={wf.name}
                          onChange={(e) => onWorkFrontNameChange(wf.id, e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full text-sm font-medium text-gray-900"
                      />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">{formatNumber(wf.allocatedCells, 0)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">{formatNumber(wf.totalPoints, 0)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{formatNumber(wf.civilHH, 0)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{formatNumber(wf.technicalHH, 0)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-800">{formatNumber(wf.totalHH, 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100">
                <tr className="font-bold text-gray-900">
                    <td className="px-4 py-2 text-left">TOTAIS</td>
                    <td className="px-4 py-2 text-center">{formatNumber(results.workFrontsDistribution.reduce((acc, wf) => acc + wf.allocatedCells, 0), 0)}</td>
                    <td className="px-4 py-2 text-center">{formatNumber(results.workFrontsDistribution.reduce((acc, wf) => acc + wf.totalPoints, 0), 0)}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(results.totalCivilManHours, 0)}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(results.totalTechnicalManHours, 0)}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(results.totalManHours, 0)}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
