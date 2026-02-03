import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Decision, AIResponse } from "@shared/schema";
import { Sparkles, Activity, Shield, Bolt, Eye, Signal } from "lucide-react";

const MODEL_STYLES: Record<string, { label: string; color: string }> = {
  grok: { label: "Grok · Risk & Momentum", color: "text-lime-300" },
  chatgpt: { label: "ChatGPT · Structure & Execution", color: "text-emerald-300" },
  claude: { label: "Claude · Ethics & Restraint", color: "text-emerald-200" },
  deepseek: { label: "DeepSeek · Quantitative", color: "text-emerald-100" },
  qwen: { label: "Qwen · Strategy & Innovation", color: "text-cyan-200" },
};

type VoteEntry = {
  id: string;
  model: keyof typeof MODEL_STYLES;
  vote: string;
  reasoning: string;
  confidence: number;
  decisionTitle: string;
  consensusRemark: string;
  createdAt: string;
};

function VotePulseCard({ entry }: { entry: VoteEntry }) {
  const modelStyle = MODEL_STYLES[entry.model] || { label: entry.model, color: "text-slate-200" };
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#081112]/80 via-[#05090f]/80 to-[#010409] p-5 shadow-[0_20px_40px_rgba(2,7,15,0.75)] transition hover:border-emerald-300/60">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/60">
        <span className={modelStyle.color}>{modelStyle.label}</span>
        <span>{entry.vote.toUpperCase()}</span>
      </div>
      <p className="mt-4 text-sm text-slate-200 line-clamp-4">{entry.reasoning}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="text-emerald-200">{entry.consensusRemark}</span>
        <span>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Confidence: <span className="text-white">{entry.confidence}%</span> · Proposal:{" "}
        <span className="text-white/80">{entry.decisionTitle}</span>
      </p>
    </div>
  );
}

function DecisionCard({ decision }: { decision: Decision }) {
  const votes = decision.responses?.map((r) => r.vote.toUpperCase()) ?? [];
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-[#061014]/90 p-5 shadow-[0_25px_60px_rgba(2,9,15,0.65)]">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-emerald-200">
        <span>{decision.category}</span>
        <span>{decision.status.replace("_", " ")}</span>
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-white">{decision.title}</h3>
      <p className="mt-3 text-sm text-slate-400 line-clamp-3">{decision.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {votes.map((vote, index) => (
          <span
            key={`${decision.id}-${index}`}
            className="rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-100"
          >
            {vote}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {decision.responses?.length ?? 0} AI votes · Updated{" "}
        {formatDistanceToNow(new Date(decision.updatedAt), { addSuffix: true })}
      </p>
    </div>
  );
}

export default function Home() {
  const { data: decisions } = useQuery<Decision[]>({
    queryKey: ["/api/decisions"],
  });

  const voteFeed = useMemo(() => {
    if (!decisions) return [];
    return decisions
      .flatMap((decision) =>
        (decision.responses || []).map((response) => ({
          id: `${decision.id}-${response.id}`,
          model: response.model,
          vote: response.vote,
          reasoning: response.reasoning,
          confidence: response.confidence,
          decisionTitle: decision.title,
          consensusRemark: decision.consensus?.outcome ?? "Pending consensus",
          createdAt: response.createdAt,
        })),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [decisions]);

  const [liveFeed, setLiveFeed] = useState<VoteEntry[]>([]);
  const nextIndex = useRef(0);

  useEffect(() => {
    setLiveFeed(voteFeed.slice(0, 4));
    nextIndex.current = voteFeed.length >= 4 ? 4 : voteFeed.length;
  }, [voteFeed]);

  useEffect(() => {
    if (!voteFeed.length) {
      setLiveFeed([]);
      return;
    }
    const interval = setInterval(() => {
      setLiveFeed((prev) => {
        const next = voteFeed[nextIndex.current % voteFeed.length];
        nextIndex.current += 1;
        return [next, ...prev].slice(0, 4);
      });
    }, 5500);
    return () => clearInterval(interval);
  }, [voteFeed]);

  const totalDecisions = decisions?.length ?? 0;
  const consensusOutcome = decisions?.[0]?.consensus?.outcome ?? "Awaiting";

  return (
    <div className="bg-[#010409] text-slate-100 min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
        <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#061015] via-[#020706] to-[#010409] p-10 shadow-[0_35px_80px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-emerald-200">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>AIGOV · Consensus Console</span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            GitHub-style autonomous governance for Solana.
          </h1>
          <p className="mt-4 text-lg text-emerald-100/80">
            AIGOV streams every AI proposal, keeps each vote visible, and pushes decisions upward through a neon-green consensus feed.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#071112]/70 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total proposals</p>
              <p className="mt-2 text-3xl font-semibold text-white">{totalDecisions}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#071112]/70 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Latest consensus</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {consensusOutcome.replace("_", " ")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#071112]/70 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Focus</p>
              <p className="mt-2 text-3xl font-semibold text-white">Token launch readiness</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/20 bg-[#0a1216]/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Live AI votes</p>
              <h2 className="text-2xl font-semibold text-white">Every proposal pushes the feed upward</h2>
            </div>
            <Activity className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {liveFeed.length ? (
              liveFeed.map((entry) => <VotePulseCard key={entry.id} entry={entry} />)
            ) : (
              <div className="col-span-1 rounded-2xl border border-dashed border-emerald-500/40 p-6 text-center text-sm text-slate-400">
                Waiting for AI votes to flow in...
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/20 bg-[#051112]/80 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Autonomous decisions</p>
              <h2 className="text-2xl font-semibold text-white">Recent verdicts & vote trail</h2>
            </div>
            <Shield className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-6 grid gap-4">
            {decisions?.length ? (
              decisions.map((decision) => <DecisionCard key={decision.id} decision={decision} />)
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-[#060c10]/70 p-6 text-slate-400">
                Autonomous engine is warming up — future proposals will appear here as they flow through the consensus.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/20 bg-[#030b0f]/80 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">System pulse</p>
              <h2 className="text-2xl font-semibold text-white">Live monitor</h2>
            </div>
            <Signal className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#071114]/60 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-green-300">
                <Bolt className="h-4 w-4" />
                <span>Auto-run cadence</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">Every 30 seconds</p>
              <p className="text-xs text-slate-400">Triggering deliberation + consensus evaluation</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#071114]/60 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-emerald-200">
                <Eye className="h-4 w-4" />
                <span>Live transparency</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">Immutable vote trail</p>
              <p className="text-xs text-slate-400">Every opinion and consensus fully logged for inspection.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
