import OpenAI from "openai";
import { agentMap } from "./agents";
import { AgentKey, AgentOutput, RunPipelineRequest, TimelineEvent } from "@/app/types/studio";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL ?? "gpt-5.6";

function contextFor(goal: string, outputs: Partial<Record<AgentKey, AgentOutput>>) {
  return Object.values(outputs).filter(Boolean).map((o) => `## ${agentMap[o!.agentId].name}\nReasoning:\n${o!.reasoning}\n\nOutput:\n${o!.output}`).join("\n\n---\n\n") || "No prior agent output yet.";
}

async function runAgent(agentId: AgentKey, goal: string, outputs: Partial<Record<AgentKey, AgentOutput>>, feedback?: string): Promise<AgentOutput> {
  const agent = agentMap[agentId];
  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: `${agent.systemPrompt}\n\nReturn valid JSON with exactly two string keys: reasoning and output. Reasoning should be a concise visible work log, not hidden chain-of-thought.` },
      { role: "user", content: `Creative goal:\n${goal}\n\nPrevious context:\n${contextFor(goal, outputs)}\n\nHuman feedback for this run:\n${feedback ?? "None"}` },
    ],
    text: { format: { type: "json_object" } },
  });
  const raw = response.output_text;
  const parsed = JSON.parse(raw) as { reasoning: string; output: string };
  return { agentId, reasoning: parsed.reasoning, output: parsed.output, feedback, createdAt: new Date().toISOString() };
}

export async function runPipeline({ goal, agents, feedback, previousOutputs = {} }: RunPipelineRequest) {
  const outputs: Partial<Record<AgentKey, AgentOutput>> = { ...previousOutputs };
  const changed: AgentOutput[] = [];
  const events: TimelineEvent[] = [];
  const startIndex = feedback ? agents.indexOf(feedback.agentId) : 0;
  const runList = feedback && !feedback.rerunDownstream ? [feedback.agentId] : agents.slice(Math.max(startIndex, 0));

  for (const agentId of runList) {
    events.push({ id: crypto.randomUUID(), at: new Date().toISOString(), agentId, title: `${agentMap[agentId].name} started`, description: agentMap[agentId].description });
    const result = await runAgent(agentId, goal, outputs, feedback?.agentId === agentId ? feedback.message : undefined);
    outputs[agentId] = result;
    changed.push(result);
    events.push({ id: crypto.randomUUID(), at: new Date().toISOString(), agentId, title: `${agentMap[agentId].name} completed`, description: "Output and visible reasoning captured." });
  }

  const finalDeliverable = outputs.refiner?.output ?? changed.at(-1)?.output ?? "";
  return { outputs: Object.values(outputs).filter(Boolean) as AgentOutput[], finalDeliverable, events };
}
