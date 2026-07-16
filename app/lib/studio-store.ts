"use client";
import { create } from "zustand";
import { agentDefinitions } from "./agents";
import { AgentKey, AgentOutput, RunPipelineResponse, StudioAgentState, TimelineEvent } from "@/app/types/studio";

const initialAgents = agentDefinitions.map((a) => ({ ...a, status: "idle" as const }));
interface StudioState { goal: string; agents: StudioAgentState[]; activeAgent?: AgentKey; finalDeliverable: string; timeline: TimelineEvent[]; isRunning: boolean; setGoal: (goal: string) => void; reorder: (agents: StudioAgentState[]) => void; runPipeline: () => Promise<void>; rerunAgent: (agentId: AgentKey, feedback: string, rerunDownstream?: boolean) => Promise<void>; }
function applyResponse(state: StudioState, data: RunPipelineResponse): Partial<StudioState> { return { agents: state.agents.map((a) => ({ ...a, status: "done", output: data.outputs.find((o) => o.agentId === a.id) ?? a.output })), finalDeliverable: data.finalDeliverable, timeline: [...data.events, ...state.timeline], activeAgent: undefined, isRunning: false }; }
export const useStudioStore = create<StudioState>((set, get) => ({
  goal: "Create a launch campaign concept for an AI-powered design tool aimed at independent creators.", agents: initialAgents, finalDeliverable: "", timeline: [], isRunning: false,
  setGoal: (goal) => set({ goal }), reorder: (agents) => set({ agents }),
  runPipeline: async () => { const { goal, agents } = get(); set({ isRunning: true, activeAgent: agents[0]?.id, agents: agents.map((a) => ({ ...a, status: "thinking" })) }); const res = await fetch("/api/pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal, agents: agents.map((a) => a.id), previousOutputs: Object.fromEntries(agents.filter((a) => a.output).map((a) => [a.id, a.output as AgentOutput])) }) }); if (!res.ok) throw new Error((await res.json()).error); set((s) => applyResponse(s, await res.json())); },
  rerunAgent: async (agentId, message, rerunDownstream = true) => { const { goal, agents } = get(); set({ isRunning: true, activeAgent: agentId, agents: agents.map((a) => ({ ...a, status: a.id === agentId ? "thinking" : a.status })) }); const previousOutputs = Object.fromEntries(agents.filter((a) => a.output).map((a) => [a.id, a.output as AgentOutput])); const res = await fetch("/api/pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal, agents: agents.map((a) => a.id), previousOutputs, feedback: { agentId, message, rerunDownstream } }) }); if (!res.ok) throw new Error((await res.json()).error); set((s) => applyResponse(s, await res.json())); },
}));
