
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ProjectInputs, Task, CalculationResults, WorkFront, TeamRole } from './types';
import { INITIAL_TASKS, INITIAL_WORK_FRONTS, INITIAL_TEAM_ROLES } from './constants';
import ProjectScopeInput from './components/ProjectScopeInput';
import TasksTable from './components/TasksTable';
import TeamConfigurator from './components/TeamConfigurator';
import ResultsDashboard from './components/ResultsDashboard';
import ConsolidatedTeamTable from './components/ConsolidatedTeamTable';
import { Briefcase, Clock, Users, BarChart2 } from 'lucide-react';

/**
 * Distribui um valor total inteiro em buckets com base em pesos, sem erros de arredondamento.
 * @param total O número total a ser distribuído.
 * @param weights Um array de números representando o peso de cada bucket.
 * @returns Um array de inteiros cuja soma é igual ao total.
 */
function distributeInteger(total: number, weights: number[]): number[] {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) {
        return weights.map(() => 0);
    }

    const exactValues = weights.map(w => (w / totalWeight) * total);
    const roundedValues = exactValues.map(v => Math.floor(v));
    let remainder = total - roundedValues.reduce((sum, v) => sum + v, 0);

    const fractionalParts = exactValues.map((v, i) => ({ index: i, fraction: v - roundedValues[i] }));
    fractionalParts.sort((a, b) => b.fraction - a.fraction);

    for (let i = 0; i < remainder; i++) {
        const idx = fractionalParts[i]?.index;
        if (idx !== undefined) {
             roundedValues[idx]++;
        }
    }

    return roundedValues;
}

const App: React.FC = () => {
  const [inputs, setInputs] = useState<ProjectInputs>({
    totalPoints: 350,
    workHoursPerDay: 8,
    peoplePerCell: 3,
    workFronts: INITIAL_WORK_FRONTS,
  });

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [teamRoles, setTeamRoles] = useState<TeamRole[]>(INITIAL_TEAM_ROLES);

  const handleInputChange = useCallback((field: keyof ProjectInputs, value: number | WorkFront[]) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTaskChange = useCallback((id: string, field: keyof Task, value: string | number) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  }, []);

  const handleWorkFrontNameChange = useCallback((id: string, newName: string) => {
    setInputs(prev => ({
        ...prev,
        workFronts: prev.workFronts.map(wf => wf.id === id ? { ...wf, name: newName } : wf)
    }));
  }, []);

  const handleTotalManHoursChange = useCallback((newTotal: number) => {
    if (newTotal < 0) return;
    
    setTasks(prevTasks => {
        const currentTotal = prevTasks.reduce((sum, t) => sum + t.manHoursPerPoint, 0);
        if (currentTotal === 0) return prevTasks;

        const ratio = newTotal / currentTotal;
        
        return prevTasks.map(task => ({
            ...task,
            manHoursPerPoint: parseFloat((task.manHoursPerPoint * ratio).toFixed(2))
        }));
    });
  }, []);

  const results = useMemo<CalculationResults>(() => {
    // 1. Calcular HH base por ponto a partir das tarefas
    const manHoursPerPointBreakdown = tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + task.manHoursPerPoint;
        return acc;
    }, {} as Record<Task['category'], number>);
    
    const technicalHours = manHoursPerPointBreakdown.technical || 0;
    const civilHours = manHoursPerPointBreakdown.civil || 0;
    const overheadHours = manHoursPerPointBreakdown.overhead || 0;

    const productiveManHours = technicalHours + civilHours;
    let overheadProportionTech = 0.5;
    let overheadProportionCivil = 0.5;

    if (productiveManHours > 0) {
        overheadProportionTech = technicalHours / productiveManHours;
        overheadProportionCivil = civilHours / productiveManHours;
    }

    const totalTechnicalManHoursPerPoint = technicalHours + (overheadHours * overheadProportionTech);
    const totalCivilManHoursPerPoint = civilHours + (overheadHours * overheadProportionCivil);
    const totalManHoursPerPoint = totalTechnicalManHoursPerPoint + totalCivilManHoursPerPoint;

    // 2. Distribuir pontos totais de forma precisa pelas frentes de trabalho
    const totalCells = inputs.workFronts.reduce((sum, wf) => sum + wf.allocatedCells, 0);
    const cellWeights = inputs.workFronts.map(wf => wf.allocatedCells);
    const distributedPoints = distributeInteger(inputs.totalPoints, cellWeights);

    // 3. Calcular a distribuição detalhada
    const workFrontsDistribution = inputs.workFronts.map((wf, index) => {
      const pointsForFront = distributedPoints[index] || 0;
      return {
        ...wf,
        totalPoints: pointsForFront,
        technicalHH: pointsForFront * totalTechnicalManHoursPerPoint,
        civilHH: pointsForFront * totalCivilManHoursPerPoint,
        totalHH: pointsForFront * totalManHoursPerPoint,
      };
    });

    // 4. Calcular os totais a partir dos valores distribuídos para garantir consistência
    const totalManHours = workFrontsDistribution.reduce((sum, wf) => sum + wf.totalHH, 0);
    const totalTechnicalManHours = workFrontsDistribution.reduce((sum, wf) => sum + wf.technicalHH, 0);
    const totalCivilManHours = workFrontsDistribution.reduce((sum, wf) => sum + wf.civilHH, 0);
    
    // 5. Calcular produtividade e duração
    const dailyHoursPerCell = inputs.peoplePerCell * inputs.workHoursPerDay;
    const dailyProductivityPerCell = totalManHoursPerPoint > 0 ? dailyHoursPerCell / totalManHoursPerPoint : 0;
    const totalDailyProductivity = dailyProductivityPerCell * totalCells;
    const projectDurationDays = totalDailyProductivity > 0 ? inputs.totalPoints / totalDailyProductivity : 0;

    return {
      totalManHours,
      totalTechnicalManHours,
      totalCivilManHours,
      totalManHoursPerPoint,
      dailyProductivityPerCell,
      totalDailyProductivity,
      projectDurationDays,
      workFrontsDistribution,
    };
  }, [inputs, tasks]);

  // Sync calculated HH to Team Roles (Consolidated Table)
  useEffect(() => {
    setTeamRoles(prevRoles => prevRoles.map(role => {
      // Sync Technical HH (tr1)
      if (role.id === 'tr1') {
         return { ...role, totalHH: results.totalTechnicalManHours.toFixed(0) };
      }
      // Sync Civil HH (tr2)
      if (role.id === 'tr2') {
         return { ...role, totalHH: results.totalCivilManHours.toFixed(0) };
      }
      return role;
    }));
  }, [results.totalTechnicalManHours, results.totalCivilManHours]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Calculadora de Dimensionamento de Mão de Obra
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            Planeje e otimize os recursos do seu projeto com base em métricas detalhadas.
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna de Configuração */}
          <div className="lg:col-span-1 flex flex-col space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><BarChart2 className="mr-2 text-blue-500"/> Parâmetros do Projeto</h2>
              <ProjectScopeInput inputs={inputs} onInputChange={handleInputChange} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><Clock className="mr-2 text-blue-500"/> Esforço por Atividade (HH/Ponto)</h2>
              <TasksTable tasks={tasks} onTaskChange={handleTaskChange} />
            </div>
             <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><Users className="mr-2 text-blue-500"/> Frentes de Trabalho</h2>
              <TeamConfigurator workFronts={inputs.workFronts} onWorkFrontsChange={(wf) => handleInputChange('workFronts', wf)} />
            </div>
          </div>
          
          {/* Coluna de Resultados */}
          <div className="lg:col-span-2 space-y-8">
            <ResultsDashboard 
                results={results} 
                teamRoles={teamRoles}
                onWorkFrontNameChange={handleWorkFrontNameChange} 
                onTotalManHoursChange={handleTotalManHoursChange}
            />
            
            {/* Nova Tabela Consolidada */}
            <ConsolidatedTeamTable teamRoles={teamRoles} onTeamRolesChange={setTeamRoles} />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Desenvolvido com React, TypeScript e Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;
