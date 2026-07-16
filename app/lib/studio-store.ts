"use client";

import { create } from "zustand";
import { agentDefinitions } from "./agents";
import {
  AgentKey,
  AgentOutput,
  RunPipelineResponse,
  StudioAgentState,
  TimelineEvent,
} from "@/app/types/studio";

const initialAgents = agentDefinitions.map((agent) => ({
  ...agent,
  status: "idle" as const,
}));

interface StudioState {
  goal: string;
  agents: StudioAgentState[];
  activeAgent?: AgentKey;
  finalDeliverable: string;
  timeline: TimelineEvent[];
  isRunning: boolean;
  setGoal: (goal: string) => void;
  reorder: (agents: StudioAgentState[]) => void;
  runPipeline: () => Promise<void>;
  rerunAgent: (
    agentId: AgentKey,
    feedback: string,
    rerunDownstream?: boolean,
  ) => Promise<void>;
}

function applyResponse(
  state: StudioState,
  data: RunPipelineResponse,
): Partial<StudioState> {
  return {
    agents: state.agents.map((agent) => ({
      ...agent,
      status: "done",
      output: data.outputs.find((output) => output.agentId === agent.id) ?? agent.output,
    })),
    finalDeliverable: data.finalDeliverable,
    timeline: [...data.events, ...state.timeline],
    activeAgent: undefined,
    isRunning: false,
  };
}

function resetRunState(state: StudioState): Partial<StudioState> {
  return {
    agents: state.agents.map((agent) => ({
      ...agent,
      status: agent.output ? "done" : "idle",
    })),
    activeAgent: undefined,
    isRunning: false,
  };
}

async function readPipelineResponse(response: Response): Promise<RunPipelineResponse> {
  if (!response.ok) {
    const { error = "The pipeline could not be completed." } = await response.json();
    throw new Error(error);
  }

  return response.json() as Promise<RunPipelineResponse>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  goal: "Create a launch campaign concept for an AI-powered design tool aimed at independent creators.",
  agents: initialAgents,
  finalDeliverable: "",
  timeline: [],
  isRunning: false,
  setGoal: (goal) => set({ goal }),
  reorder: (agents) => set({ agents }),
  runPipeline: async () => {
    const { goal, agents } = get();
    set({
      isRunning: true,
      activeAgent: agents[0]?.id,
      agents: agents.map((agent) => ({ ...agent, status: "thinking" })),
    });

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          agents: agents.map((agent) => agent.id),
          previousOutputs: Object.fromEntries(
            agents
              .filter((agent) => agent.output)
              .map((agent) => [agent.id, agent.output as AgentOutput]),
          ),
        }),
      });
      const data = await readPipelineResponse(response);
      set((state) => applyResponse(state, data));
    } catch (error) {
      set((state) => resetRunState(state));
      throw error;
    }
  },
  rerunAgent: async (agentId, message, rerunDownstream = true) => {
    const { goal, agents } = get();
    set({
      isRunning: true,
      activeAgent: agentId,
      agents: agents.map((agent) => ({
        ...agent,
        status: agent.id === agentId ? "thinking" : agent.status,
      })),
    });

    try {
      const previousOutputs = Object.fromEntries(
        agents
          .filter((agent) => agent.output)
          .map((agent) => [agent.id, agent.output as AgentOutput]),
      );
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          agents: agents.map((agent) => agent.id),
          previousOutputs,
          feedback: { agentId, message, rerunDownstream },
        }),
      });
      const data = await readPipelineResponse(response);
      set((state) => applyResponse(state, data));
    } catch (error) {
      set((state) => resetRunState(state));
      throw error;
    }
  },
}));
