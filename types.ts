
export interface Task {
  id: string;
  phase: string;
  name: string;
  manHoursPerPoint: number;
  category: 'technical' | 'civil' | 'overhead';
}

export interface WorkFront {
    id: string;
    name: string;
    allocatedCells: number;
}

export interface ProjectInputs {
  totalPoints: number;
  workHoursPerDay: number;
  peoplePerCell: number;
  workFronts: WorkFront[];
}

export interface WorkFrontDistribution extends WorkFront {
    totalPoints: number;
    technicalHH: number;
    civilHH: number;
    totalHH: number;
}

export interface TeamRole {
    id: string;
    category: string;
    function: string;
    quantity: number;
    totalHH: string; // String to allow "N/A" or comments
    responsibilities: string;
}

export interface CalculationResults {
  totalManHours: number;
  totalTechnicalManHours: number;
  totalCivilManHours: number;
  totalManHoursPerPoint: number;
  dailyProductivityPerCell: number;
  totalDailyProductivity: number;
  projectDurationDays: number;
  workFrontsDistribution: WorkFrontDistribution[];
}
