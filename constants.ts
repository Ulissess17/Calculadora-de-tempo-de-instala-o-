
import { Task, WorkFront, TeamRole } from './types';

export const INITIAL_TASKS: Task[] = [
  { id: 't1', phase: 'Fase 2: Elétrica', name: 'Derivação Elétrica', manHoursPerPoint: 7, category: 'technical' },
  { id: 't2', phase: 'Fase 2: Civil', name: 'Instalação de Poste', manHoursPerPoint: 5, category: 'civil' },
  { id: 't3', phase: 'Fase 3: Mecânica', name: 'Caixa Hermética (Montagem)', manHoursPerPoint: 3.7, category: 'technical' },
  { id: 't4', phase: 'Fase 3: Adicional', name: 'Módulo de Telemetria', manHoursPerPoint: 0.3, category: 'technical' },
  { id: 't5', phase: 'Fase 3: Ativos', name: 'Câmera e Antena', manHoursPerPoint: 2, category: 'technical' },
  { id: 't6', phase: 'Fase 4: Lógica', name: 'Comissionamento (Ativação)', manHoursPerPoint: 5, category: 'technical' },
  { id: 't7', phase: 'N/A', name: 'Deslocamento e Improdutividade', manHoursPerPoint: 5, category: 'overhead' },
];

export const INITIAL_WORK_FRONTS: WorkFront[] = [
    { id: 'wf1', name: '23º BPM/I (Lorena)', allocatedCells: 4 },
    { id: 'wf2', name: '20º BPM/I (Caraguatatuba)', allocatedCells: 2 },
    { id: 'wf3', name: '46º BPM/I (S. J. dos Campos)', allocatedCells: 1 },
    { id: 'wf4', name: '5º BPM/I (Taubaté)', allocatedCells: 1 },
    { id: 'wf5', name: '41º BPM/I (Jacareí)', allocatedCells: 1 },
];

export const INITIAL_TEAM_ROLES: TeamRole[] = [
    { 
        id: 'tr1', 
        category: 'Equipe de Campo', 
        function: 'Técnico de Instalação (Elétrica/Telecom)', 
        quantity: 18, 
        totalHH: '6480', 
        responsibilities: 'Montagem de gabinetes, derivação elétrica, instalação e configuração de câmeras e switches.' 
    },
    { 
        id: 'tr2', 
        category: 'Equipe de Campo', 
        function: 'Profissional de Infraestrutura Civil', 
        quantity: 9, 
        totalHH: '3240', 
        responsibilities: 'Execução de fundações, instalação de postes e recomposição de vias (asfalto/calçadas).' 
    },
    { 
        id: 'tr3', 
        category: 'Equipe de Suporte e Gestão', 
        function: 'Engenheiro Eletricista/ Supervisor de Obras', 
        quantity: 3, 
        totalHH: '2640', 
        responsibilities: 'Gestão das obras civis, garantindo conformidade e qualidade. Responsável técnico (ART).' 
    },
    { 
        id: 'tr4', 
        category: 'Equipe de Suporte e Gestão', 
        function: 'Engenheiro/Coordenador de Projeto', 
        quantity: 1, 
        totalHH: '528', 
        responsibilities: 'Gestão geral do projeto, cronograma, equipes e interface com o cliente.' 
    },
    { 
        id: 'tr5', 
        category: 'Equipe de Suporte e Gestão', 
        function: 'Projetista', 
        quantity: 1, 
        totalHH: '528', 
        responsibilities: 'Desenvolvimento, teste e homologação do conector (API) para o Muralha Paulista.' 
    },
    { 
        id: 'tr6', 
        category: 'Equipe de Suporte e Gestão', 
        function: 'Suporte Administrativo / Logística', 
        quantity: 2, 
        totalHH: '1056', 
        responsibilities: 'Gestão de aquisições, frota, materiais e acompanhamento dos processos de licenciamento.' 
    },
    { 
        id: 'tr7', 
        category: 'Equipe de Operação Residente', 
        function: 'Operador de Plataforma (On-site 24/7)', 
        quantity: 4, 
        totalHH: '0', 
        responsibilities: 'Operação da solução 24/7, monitoramento da saúde do sistema, ponto focal no CICC.' 
    }
];
