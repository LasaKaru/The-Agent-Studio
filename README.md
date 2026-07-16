# The Studio

**The Studio** is a visual, human-directed creative production workspace. Give the team a creative goal, then follow a specialist pipeline from research through a polished final deliverable. Every stage is inspectable, and human feedback can re-run a single agent or refresh the rest of the production line.

Built for the OpenAI Build Week hackathon in the **Work & Productivity** track.

## What it does

- Runs a five-stage AI production pipeline: **Researcher → Ideator → Drafter → Critic → Refiner**.
- Uses real server-side **GPT-5.6** calls through the OpenAI Responses API; it is not a simulated workflow.
- Passes each completed agent's structured output into subsequent stages as working context.
- Presents concise, inspectable work logs and deliverables for every agent without exposing private chain-of-thought.
- Lets a person add feedback to any stage and choose whether to re-run only that agent or its downstream collaborators too.
- Supports pipeline reordering, a live collaboration timeline, copying the final deliverable, and Markdown export.

## How it works

```text
Creative goal
    ↓
Researcher ── insights and constraints
    ↓
Ideator ──── strategic concept and options
    ↓
Drafter ──── first complete deliverable
    ↓
Critic ───── actionable review
    ↓
Refiner ──── final polished deliverable
```

The orchestration route executes the current pipeline order sequentially. Each role has a dedicated system prompt in `app/lib/agents.ts`. The orchestrator in `app/lib/orchestrator.ts` gathers prior outputs, includes any human feedback, asks the model for structured JSON, and makes the result available to the next role.

## Tech stack

- Next.js 15, App Router, TypeScript
- Tailwind CSS and Framer Motion
- Zustand for client state
- OpenAI JavaScript SDK and the Responses API
- GPT-5.6 (configured by `OPENAI_MODEL`, default `gpt-5.6`)

## Run locally

### Prerequisites

- Node.js 20 or newer
- An OpenAI API key with access to the configured model

### Setup

```bash
git clone https://github.com/LasaKaru/The-Agent-Studio.git
cd The-Agent-Studio
npm install
```

Create `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000` for the landing page, then select **Open Studio** or visit `/studio`.

## Testing

```bash
npm run typecheck
npm run build
```

To test a real run, add `OPENAI_API_KEY`, enter a creative goal in the studio command bar, and start the pipeline. The final Refiner output becomes the final deliverable.

## Project structure

```text
app/
├── (dashboard)/studio/     # Production workspace
├── api/pipeline/           # Server-only orchestration endpoint
├── components/studio/      # Pipeline and agent-inspection UI
├── lib/agents.ts           # Role definitions and strong system prompts
├── lib/orchestrator.ts     # Context passing and feedback-loop execution
├── lib/studio-store.ts     # Zustand session state
└── types/studio.ts         # Extensible session, output, and feedback models
```

## Architecture notes

The app deliberately separates the UI, client state, agent definitions, and server orchestration layer. This keeps future work such as authentication, durable sessions, Prisma persistence, additional roles, usage controls, and team collaboration from being coupled to the dashboard.

`OPENAI_API_KEY` is read only on the server by the API route. Never expose it through a `NEXT_PUBLIC_` variable or commit it to source control.

## Hackathon demo guide

A concise three-minute demo can show:

1. Enter a creative goal and launch the five-agent pipeline.
2. Open an agent card to inspect its output and visible work log.
3. Add feedback to the Drafter, re-run downstream agents, and show the updated final deliverable.
4. Copy or export the polished result as Markdown.

## How we collaborated with Codex and GPT-5.6

Codex accelerated the implementation by helping establish the App Router structure, build the dark visual pipeline UI, define strongly typed shared models, and organize the orchestration and state-management layers. Human product and engineering decisions set the experience: a visible production line, explicit human approval and feedback loops, role-specific collaboration, and a safe distinction between useful work summaries and private reasoning.

GPT-5.6 is the creative engine inside the product. The app invokes it once per specialized role, passing forward the previous agents' outputs and any human feedback. This produces a traceable, multi-stage deliverable rather than a single undifferentiated generation. The project history and Codex session used to build the core workflow provide the required evidence of that collaboration.

## License

No license has been selected yet. Add one before reusing or distributing the project beyond hackathon evaluation.
