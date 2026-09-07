import { create } from 'zustand';
import type { OfficeCharacterName } from '../scene/cast';
import type { AccentColorName } from '../design/tokens';

export type AgentStatus = 'idle' | 'working' | 'thinking' | 'blocked' | 'success';

export interface Agent {
  id: string;
  name: string;
  character: OfficeCharacterName;
  gender: 'male' | 'female';
  accent: AccentColorName;
  description: string;
  status: AgentStatus;
  action: string;
  lastPrompt?: string;
  doneTasksCount: number;
  isGod?: boolean;
  x?: number;
  y?: number;
  isSeated?: boolean;
  deskIndex?: number;
}

export interface BenchCandidate {
  name: string;
  gender: 'male' | 'female';
  character: OfficeCharacterName;
  suggestedRole: string;
}

export interface OfficeState {
  agents: Agent[];
  benchCandidates: BenchCandidate[];
  selectedAgentId: string | null;
  activeDeskMenu: { deskIndex: number; deskTile: { x: number; y: number }; agentId?: string } | null;
  officeTheme: string;
  addAgent: (agent: Omit<Agent, 'id' | 'doneTasksCount'>) => void;
  hireFromBench: (candidateName: string, role: string) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  selectAgent: (id: string | null) => void;
  setAgentStatus: (id: string, status: AgentStatus) => void;
  setAgentAction: (id: string, action: string) => void;
  setAgentSeated: (id: string, isSeated: boolean) => void;
  openDeskMenu: (deskIndex: number, deskTile: { x: number; y: number }, agentId?: string) => void;
  closeDeskMenu: () => void;
}

// Strictly MALE names mapped to MALE character avatars:
// Male avatars: michael, jim, dwight, kevin, oscar, stanley, andy, ryan, toby, creed
// Strictly FEMALE names mapped to FEMALE character avatars:
// Female avatars: pam, angela, phyllis, kelly, meredith

const DEFAULT_ACTIVE_AGENTS: Agent[] = [
  {
    id: 'agent-aarav',
    name: 'Aarav',
    gender: 'male',
    character: 'michael',
    accent: 'lemon',
    description: 'Regional Director & Office Lead',
    status: 'working',
    action: 'Reviewing quarterly targets',
    lastPrompt: 'Keep all systems running smoothly',
    doneTasksCount: 14,
    isGod: true,
  },
  {
    id: 'agent-arjun',
    name: 'Arjun',
    gender: 'male',
    character: 'jim',
    accent: 'sky',
    description: 'Lead Software Engineer',
    status: 'working',
    action: 'Editing App.tsx & refactoring UI',
    lastPrompt: 'Optimize React component rendering',
    doneTasksCount: 10,
  },
  {
    id: 'agent-ananya',
    name: 'Ananya',
    gender: 'female',
    character: 'pam',
    accent: 'mint',
    description: 'UI/UX Lead & Office Coordinator',
    status: 'working',
    action: 'Designing dashboard layout',
    lastPrompt: 'Review user feedback and wireframes',
    doneTasksCount: 16,
  },
  {
    id: 'agent-rohan',
    name: 'Rohan',
    gender: 'male',
    character: 'dwight',
    accent: 'peach',
    description: 'Systems Administrator & Security Lead',
    status: 'working',
    action: 'Monitoring server room status',
    lastPrompt: 'Ensure zero system downtime',
    doneTasksCount: 22,
  },
  {
    id: 'agent-aadhya',
    name: 'Aadhya',
    gender: 'female',
    character: 'angela',
    accent: 'lilac',
    description: 'Head of Finance & Accounting',
    status: 'working',
    action: 'Auditing financial statements',
    lastPrompt: 'Verify quarterly budget reports',
    doneTasksCount: 8,
  },
  {
    id: 'agent-aditya',
    name: 'Aditya',
    gender: 'male',
    character: 'kevin',
    accent: 'sky',
    description: 'Data Analyst & Accountant',
    status: 'working',
    action: 'Processing data metrics',
    lastPrompt: 'Calculate performance analytics',
    doneTasksCount: 5,
  },
  {
    id: 'agent-rahul',
    name: 'Rahul',
    gender: 'male',
    character: 'oscar',
    accent: 'coral',
    description: 'Senior Backend Architect',
    status: 'working',
    action: 'Optimizing API endpoints',
    lastPrompt: 'Improve database query response times',
    doneTasksCount: 13,
  },
  {
    id: 'agent-dhruv',
    name: 'Dhruv',
    gender: 'male',
    character: 'stanley',
    accent: 'peach',
    description: 'Senior QA Engineer',
    status: 'working',
    action: 'Running regression test suite',
    lastPrompt: 'Validate release build stability',
    doneTasksCount: 9,
  },
  {
    id: 'agent-priya',
    name: 'Priya',
    gender: 'female',
    character: 'phyllis',
    accent: 'lilac',
    description: 'Product Manager',
    status: 'working',
    action: 'Updating feature roadmap',
    lastPrompt: 'Plan upcoming sprint goals',
    doneTasksCount: 11,
  },
  {
    id: 'agent-ishaan',
    name: 'Ishaan',
    gender: 'male',
    character: 'andy',
    accent: 'mint',
    description: 'Fullstack Developer',
    status: 'working',
    action: 'Writing integration tests',
    lastPrompt: 'Cover edge cases in authentication',
    doneTasksCount: 7,
  },
];

const INITIAL_BENCH_CANDIDATES: BenchCandidate[] = [
  { name: 'Diya', gender: 'female', character: 'kelly', suggestedRole: 'Customer Support Lead' },
  { name: 'Kavya', gender: 'female', character: 'meredith', suggestedRole: 'Supplier Manager' },
  { name: 'Meera', gender: 'female', character: 'pam', suggestedRole: 'Frontend Developer' },
  { name: 'Karan', gender: 'male', character: 'ryan', suggestedRole: 'DevOps Specialist' },
  { name: 'Siddharth', gender: 'male', character: 'toby', suggestedRole: 'HR & Operations' },
  { name: 'Isha', gender: 'female', character: 'angela', suggestedRole: 'Compliance Analyst' },
  { name: 'Nisha', gender: 'female', character: 'phyllis', suggestedRole: 'Marketing Manager' },
  { name: 'Riya', gender: 'female', character: 'kelly', suggestedRole: 'Product Designer' },
];

export const useStore = create<OfficeState>((set) => ({
  agents: DEFAULT_ACTIVE_AGENTS,
  benchCandidates: INITIAL_BENCH_CANDIDATES,
  selectedAgentId: 'agent-aarav',
  activeDeskMenu: null,
  officeTheme: 'office',

  addAgent: (agent) =>
    set((state) => ({
      agents: [
        ...state.agents,
        {
          ...agent,
          id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          doneTasksCount: 0,
        },
      ],
    })),

  hireFromBench: (candidateName, role) =>
    set((state) => {
      const candidate = state.benchCandidates.find((c) => c.name === candidateName);
      if (!candidate) return state;

      const newAgent: Agent = {
        id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: candidate.name,
        gender: candidate.gender,
        character: candidate.character,
        accent: candidate.gender === 'female' ? 'lilac' : 'sky',
        description: role || candidate.suggestedRole,
        status: 'working',
        action: 'Onboarded & ready to work',
        doneTasksCount: 0,
      };

      return {
        agents: [...state.agents, newAgent],
        benchCandidates: state.benchCandidates.filter((c) => c.name !== candidateName),
        selectedAgentId: newAgent.id,
      };
    }),

  removeAgent: (id) =>
    set((state) => {
      const removedAgent = state.agents.find((a) => a.id === id);
      const updatedAgents = state.agents.filter((a) => a.id !== id);

      // Return removed worker to bench candidates pool if not god
      let updatedBench = state.benchCandidates;
      if (removedAgent && !removedAgent.isGod) {
        updatedBench = [
          ...state.benchCandidates,
          {
            name: removedAgent.name,
            gender: removedAgent.gender,
            character: removedAgent.character,
            suggestedRole: removedAgent.description,
          },
        ];
      }

      return {
        agents: updatedAgents,
        benchCandidates: updatedBench,
        selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
        activeDeskMenu: null,
      };
    }),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  selectAgent: (id) => set({ selectedAgentId: id }),

  setAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  setAgentAction: (id, action) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, action } : a)),
    })),

  setAgentSeated: (id, isSeated) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, isSeated } : a)),
    })),

  openDeskMenu: (deskIndex, deskTile, agentId) =>
    set({
      activeDeskMenu: { deskIndex, deskTile, agentId },
    }),

  closeDeskMenu: () => set({ activeDeskMenu: null }),
}));
