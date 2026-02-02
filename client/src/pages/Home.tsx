import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Decision, AIResponse } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const MODEL_STYLES: Record<string, { label: string; color: string }> = {
  grok: { label: "Grok · Risk & Momentum", color: "text-amber-400" },
  chatgpt: { label: "ChatGPT · Structure & Execution", color: "text-emerald-400" },
  claude: { label: "Claude · Ethics & Restraint", color: "text-sky-400" },
  deepseek: { label: "DeepSeek · Quantitative", color: "text-violet-400" },
  qwen: { label: "Qwen · Strategy & Innovation", color: "text-cyan-400" },
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
    <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 p-4 shadow-[0_20px_40px_rgba(2,7,15,0.6)] transition hover:border-white/30">
      <div className="flex items-center justify-between text-sm uppercase tracking-widest text-white/60">
        <span className={modelStyle.color}>{modelStyle.label}</span>
        <span>{entry.vote.toUpperCase()}</span>
      </div>
      <p className="mt-3 text-sm text-slate-300 line-clamp-4">{entry.reasoning}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span className="text-indigo-200">{entry.consensusRemark}</span>
        <span>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        Confidence: <span className="text-white">{entry.confidence}%</span> · Proposal:{" "}
        <span className="text-white/80">{entry.decisionTitle}</span>
      </div>
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
          consensusRemark: decision.consensus?.outcome || "Pending consensus",
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
    }, 5000);
    return () => clearInterval(interval);
  }, [voteFeed]);

  const latestDecision = decisions?.[0];
  const totalDecisions = decisions?.length ?? 0;

  return (
    <div className="bg-[#010409] text-slate-100 min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12">
        <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#161b22]/80 via-[#0d1117]/80 to-[#020409]/90 p-10 shadow-[0_30px_60px_rgba(2,7,15,0.8)]">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">AIGOV · Consensus Console</p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            GitHub-grade governance where five AI minds continuously debate, vote, and execute.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Every proposal is logged, every vote is visible, and every decision respects the 2/3 rule. The feed
            below mimics how new ideas push the narrative upward—just like a scrolling GitHub activity stream.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0d1117]/70 p-4 text-sm">
              <p className="text-sm text-slate-400">Live proposals</p>
              <p className="mt-2 text-2xl font-semibold text-white">{totalDecisions}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d1117]/70 p-4 text-sm">
              <p className="text-sm text-slate-400">Latest consensus</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {latestDecision?.consensus?.outcome ?? "Awaiting"} · {latestDecision?.title ?? "No decisions yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d1117]/70 p-4 text-sm">
              <p className="text-sm text-slate-400">Primary focus</p>
              <p className="mt-2 text-2xl font-semibold text-white">Token launch readiness</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-[#0b111a]/80 p-8 shadow-[0_20px_60px_rgba(2,7,15,0.8)]">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Live AI proposals</p>
            <h2 className="text-2xl font-semibold text-white">Votes cascade like GitHub activity</h2>
            <p className="text-sm text-slate-400">
              Every time an AI weighs in, the rationale flows up and pushes the story forward. The newest votes always
              appear at the top, keeping the debate honest and transparent.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {liveFeed.map((entry) => (
              <VotePulseCard key={entry.id} entry={entry} />
            ))}
            {!liveFeed.length && (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-slate-400">
                Waiting for AI proposals to stream in…
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-[#020409]/80 p-8 shadow-[0_25px_70px_rgba(2,7,15,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Decision pipeline</p>
              <h2 className="text-2xl font-semibold text-white">Momentum is built transparently</h2>
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
              Auto-run every 30s
            </span>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {["Grok", "ChatGPT", "Claude"].map((title) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-[#0d1117]/60 p-5 text-sm text-slate-300"
              >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-xs text-slate-400">
                  Reads real-time wallet + market state, debates risk, and proposes an action direction.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
