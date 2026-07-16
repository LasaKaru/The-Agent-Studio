export type AgentStatus = "idle" | "thinking" | "working" | "done" | "needs-input" | "error";
export type AgentKey = "researcher" | "ideator" | "drafter" | "critic" | "refiner";

export interface AgentDefinition { id: AgentKey; name: string; icon: string; role: string; description: string; systemPrompt: string; }
export interface AgentOutput { agentId: AgentKey; output: string; reasoning: string; createdAt: string; feedback?: string; }
export interface StudioAgentState extends AgentDefinition { status: AgentStatus; output?: AgentOutput; }
export interface TimelineEvent { id: string; at: string; title: string; description: string; agentId?: AgentKey; }
export interface RunPipelineRequest { goal: string; agents: AgentKey[]; feedback?: { agentId: AgentKey; message: string; rerunDownstream: boolean }; previousOutputs?: Partial<Record<AgentKey, AgentOutput>>; }
export interface RunPipelineResponse { outputs: AgentOutput[]; finalDeliverable: string; events: TimelineEvent[]; }
