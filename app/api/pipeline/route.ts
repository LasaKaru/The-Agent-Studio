import { NextResponse } from "next/server";
import { runPipeline } from "@/app/lib/orchestrator";
import { RunPipelineRequest } from "@/app/types/studio";

export const maxDuration = 120;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY is required for real GPT-5.6 orchestration." }, { status: 500 });
  try {
    const body = (await request.json()) as RunPipelineRequest;
    if (!body.goal?.trim()) return NextResponse.json({ error: "A creative goal is required." }, { status: 400 });
    return NextResponse.json(await runPipeline(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown orchestration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
