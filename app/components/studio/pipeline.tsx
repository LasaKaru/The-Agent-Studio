"use client";

import { motion } from "framer-motion";
import type { DragEvent, MouseEvent } from "react";
import { StudioAgentState } from "@/app/types/studio";
import { cn } from "@/app/lib/utils";

interface PipelineProps {
  agents: StudioAgentState[];
  activeAgent?: string;
  onReorder: (agents: StudioAgentState[]) => void;
  onSelect: (agent: StudioAgentState) => void;
}

export function Pipeline({ agents, activeAgent, onReorder, onSelect }: PipelineProps) {
  const move = (from: number, delta: number) => {
    const to = from + delta;
    if (to < 0 || to >= agents.length) return;

    const next = [...agents];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  };

  const reorderByDrop = (event: DragEvent<HTMLElement>, targetIndex: number) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(sourceIndex) || sourceIndex === targetIndex) return;

    const next = [...agents];
    const [item] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, item);
    onReorder(next);
  };

  const stopClick = (event: MouseEvent<HTMLButtonElement>, delta: number, index: number) => {
    event.stopPropagation();
    move(index, delta);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {agents.map((agent, index) => (
        <motion.div layout key={agent.id} className="min-w-64">
          <article
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => reorderByDrop(event, index)}
            onClick={() => onSelect(agent)}
            className={cn(
              "cursor-pointer rounded-3xl border p-5 text-left",
              activeAgent === agent.id
                ? "border-cyan-300 bg-cyan-300/10"
                : "border-slate-700 bg-slate-900/80",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{agent.icon}</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-cyan-200">
                {agent.status}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold">{agent.name}</h3>
            <p className="text-sm text-cyan-200">{agent.role}</p>
            <p className="mt-2 text-sm text-slate-400">{agent.description}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={(event) => stopClick(event, -1, index)}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs"
                aria-label={`Move ${agent.name} earlier`}
              >
                ←
              </button>
              <button
                type="button"
                onClick={(event) => stopClick(event, 1, index)}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs"
                aria-label={`Move ${agent.name} later`}
              >
                →
              </button>
            </div>
          </article>
        </motion.div>
      ))}
    </div>
  );
}
