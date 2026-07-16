import Link from "next/link";
import { ArrowRight, BrainCircuit, GitBranch, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,.24),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,.24),transparent_25%)]" />
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold"><Sparkles className="text-cyan-300" /> The Studio</div>
          <Link className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-300/10" href="/studio">Open Studio</Link>
        </nav>
        <div className="grid flex-1 items-center gap-12 py-20 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200">Visual GPT-5.6 multi-agent production</p>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">Turn creative goals into polished deliverables with an AI team.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">The Studio makes every specialist visible: research, ideation, drafting, critique, and refinement happen in an inspectable pipeline with feedback loops.</p>
            <Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-200" href="/studio">Start producing <ArrowRight size={18} /></Link>
          </div>
          <div className="glass rounded-3xl p-6">
            {["Researcher", "Ideator", "Drafter", "Critic", "Refiner"].map((agent, i) => <div key={agent} className="mb-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4"><span className="text-cyan-300">0{i+1}</span> {agent}<p className="text-sm text-slate-400">Specialized context-aware collaboration stage</p></div>)}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
        {[{icon:BrainCircuit,title:"Role-specific agents",text:"Every stage has a strong system prompt and structured outputs."},{icon:GitBranch,title:"Feedback loops",text:"Re-run a stage with human feedback and refresh downstream context."},{icon:Sparkles,title:"Production-ready UX",text:"Drag, inspect, copy, export, and monitor progress in real time."}].map(({icon:Icon,title,text}) => <article className="glass rounded-3xl p-6" key={title}><Icon className="mb-4 text-cyan-300"/><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-slate-400">{text}</p></article>)}
      </section>
    </main>
  );
}
