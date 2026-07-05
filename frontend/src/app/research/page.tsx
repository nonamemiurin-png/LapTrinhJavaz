"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CONFIG } from "@/lib/config";

interface EvaluationResult {
  rag_model: {
    answer: string;
    sources: string[];
  };
  fine_tuned_model: {
    answer: string;
  };
  evaluation_score: string;
}

interface BenchmarkSummary {
  status: string;
  testSetSize: number;
  rag: { meanTokenF1: number; citationHitRate: number; refusalAccuracy: number; p50LatencyMs: number; p95LatencyMs: number };
  fineTuned: { model: string; meanTokenF1: number; refusalAccuracy: number; p50LatencyMs: number; p95LatencyMs: number };
  chunkingBenchmark?: {
    embeddingModel: string;
    bestStrategy: string;
    results: Array<{ strategy: string; hitAt5: number; mrr: number; ndcgAt5: number }>;
  };
  embeddingBenchmark?: {
    bestMeasuredModel: string;
    openAiStatus: string;
    results: Array<{ model: string; hitAt5: number; mrr: number; ndcgAt5: number }>;
  };
  ragas?: {
    sampleSize: number;
    faithfulness: number;
    answerRelevancy: number;
    contextPrecision: number;
    contextRecall: number;
    method: string;
    embeddingModel: string;
    supportThreshold: number;
  };
}

export default function ResearchDashboard() {
  const [query, setQuery] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkSummary | null>(null);

  useEffect(() => {
    fetch("/benchmark-summary.json")
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Không tải được benchmark")))
      .then(setBenchmark)
      .catch(console.error);
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsEvaluating(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/evaluate/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, sessionId: crypto.randomUUID() })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi chạy đánh giá.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-6 pb-10 overflow-y-auto">
      <header className="pt-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
          Research Module (RBL)
        </h1>
        <p className="text-slate-500 mt-2">Đánh giá và so sánh hiệu năng giữa kiến trúc RAG và Mô hình gốc (Giả lập Fine-tuned) trong bối cảnh tiếng Việt.</p>
      </header>

      {benchmark && (
        <section className="bg-white/70 dark:bg-slate-800/70 border border-white/20 shadow-xl rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Benchmark batch 50 câu</h2>
              <p className="text-sm text-slate-500">Kết quả thực nghiệm paired trên cùng test set tiếng Việt</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">HOÀN THÀNH 50/50</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Token F1" rag={benchmark.rag.meanTokenF1} fineTuned={benchmark.fineTuned.meanTokenF1} format="score" />
            <MetricCard title="Từ chối ngoài phạm vi" rag={benchmark.rag.refusalAccuracy} fineTuned={benchmark.fineTuned.refusalAccuracy} format="percent" />
            <MetricCard title="Latency p50" rag={benchmark.rag.p50LatencyMs} fineTuned={benchmark.fineTuned.p50LatencyMs} format="ms" lowerIsBetter />
            <MetricCard title="Latency p95" rag={benchmark.rag.p95LatencyMs} fineTuned={benchmark.fineTuned.p95LatencyMs} format="ms" lowerIsBetter />
          </div>
          <div className="mt-5 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-sm text-indigo-900 dark:text-indigo-200">
            <strong>Kết luận:</strong> RAG đạt F1 cao hơn khoảng {(benchmark.rag.meanTokenF1 / benchmark.fineTuned.meanTokenF1).toFixed(2)} lần,
            citation hit {(benchmark.rag.citationHitRate * 100).toFixed(2)}% và kiểm soát câu ngoài phạm vi tốt hơn model fine-tuned local.
          </div>
          {benchmark.chunkingBenchmark && (
            <div className="mt-5 overflow-x-auto">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">So sánh chunking strategy</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Strategy</th><th>Hit@5</th><th>MRR</th><th>nDCG@5</th></tr></thead>
                <tbody>{benchmark.chunkingBenchmark.results.map(item => (
                  <tr key={item.strategy} className={`border-b border-slate-100 ${item.strategy === benchmark.chunkingBenchmark?.bestStrategy ? "font-bold text-indigo-600" : ""}`}>
                    <td className="py-2 capitalize">{item.strategy}</td><td>{item.hitAt5.toFixed(4)}</td><td>{item.mrr.toFixed(4)}</td><td>{item.ndcgAt5.toFixed(4)}</td>
                  </tr>
                ))}</tbody>
              </table>
              <p className="text-xs text-slate-500 mt-2">Embedding cố định: {benchmark.chunkingBenchmark.embeddingModel}. Semantic đạt thứ hạng retrieval tốt nhất.</p>
            </div>
          )}
          {benchmark.embeddingBenchmark && (
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">So sánh 3 embedding model</h3>
                  <p className="text-xs text-slate-500 mt-1">Cùng fixed chunking, cùng 45 câu answerable và cùng top-k.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold">
                  {benchmark.embeddingBenchmark.results.length} MODELS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {benchmark.embeddingBenchmark.results.map(item => {
                  const isBest = item.model === benchmark.embeddingBenchmark?.bestMeasuredModel;
                  return (
                    <div key={`card-${item.model}`} className={`rounded-2xl border p-4 ${isBest ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40"}`}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 break-all">{item.model}</p>
                        {isBest && <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500 text-white font-bold">TỐT NHẤT</span>}
                      </div>
                      <dl className="space-y-2 text-xs">
                        <div className="flex justify-between"><dt className="text-slate-500">Hit@5</dt><dd className="font-mono font-semibold">{item.hitAt5.toFixed(4)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">MRR</dt><dd className="font-mono font-semibold">{item.mrr.toFixed(4)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">nDCG@5</dt><dd className="font-mono font-semibold">{item.ndcgAt5.toFixed(4)}</dd></div>
                      </dl>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Model</th><th>Hit@5</th><th>MRR</th><th>nDCG@5</th></tr></thead>
                <tbody>{benchmark.embeddingBenchmark.results.map(item => (
                  <tr key={item.model} className={`border-b border-slate-100 ${item.model === benchmark.embeddingBenchmark?.bestMeasuredModel ? "font-bold text-indigo-600" : ""}`}>
                    <td className="py-2">{item.model}</td><td>{item.hitAt5.toFixed(4)}</td><td>{item.mrr.toFixed(4)}</td><td>{item.ndcgAt5.toFixed(4)}</td>
                  </tr>
                ))}</tbody>
              </table>
              </div>
              <p className="text-xs text-amber-600 mt-2">text-embedding-3-small được loại khỏi phạm vi do không có API credit; không sử dụng số liệu mô phỏng.</p>
            </div>
          )}
          {benchmark.ragas && (
            <div className="mt-5 overflow-x-auto">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">RAGAS semantic benchmark</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Faithfulness</th><th>Answer relevancy</th><th>Context precision</th><th>Context recall</th></tr></thead>
                <tbody><tr className="border-b border-slate-100 font-semibold text-emerald-700">
                  <td className="py-2">{benchmark.ragas.faithfulness.toFixed(4)}</td>
                  <td>{benchmark.ragas.answerRelevancy.toFixed(4)}</td>
                  <td>{benchmark.ragas.contextPrecision.toFixed(4)}</td>
                  <td>{benchmark.ragas.contextRecall.toFixed(4)}</td>
                </tr></tbody>
              </table>
              <p className="text-xs text-slate-500 mt-2">
                {benchmark.ragas.sampleSize} câu; local semantic fallback bằng {benchmark.ragas.embeddingModel}, ngưỡng {benchmark.ragas.supportThreshold}. Không phải LLM-judge RAGAS chuẩn.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Control Panel */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6">
        <h2 className="text-xl font-semibold mb-4">A/B Testing Thực nghiệm</h2>
        <form onSubmit={handleEvaluate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Nhập câu hỏi để kiểm tra độ chính xác và ảo giác:</label>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="VD: Hãy so sánh sự khác nhau giữa Array và Linked List?" 
              className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>
          <button 
            type="submit" 
            disabled={!query.trim() || isEvaluating}
            className="h-[50px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl px-6 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isEvaluating ? "Đang đánh giá..." : "Chạy thực nghiệm"}
          </button>
        </form>
      </div>

      {result && (
        <div className="flex flex-col xl:flex-row gap-6 mt-2">
          {/* Compare Results */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RAG Column */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-t-4 border-indigo-500 shadow-xl rounded-3xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">Kiến trúc RAG (Gemini + VectorDB)</h3>
                <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 px-2 py-1 rounded">
                  RAG
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.rag_model.answer}
                </ReactMarkdown>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Tài liệu tham chiếu (Context retrieved): {result.rag_model.sources?.length || 0}</p>
                <div className="flex flex-wrap gap-1">
                  {result.rag_model.sources?.map((s, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Base Model Column */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-t-4 border-purple-500 shadow-xl rounded-3xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400">Mô hình Gốc (No Context)</h3>
                <span className="text-xs font-mono bg-purple-50 dark:bg-purple-900/30 text-purple-700 px-2 py-1 rounded">
                  Fine-tuned
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.fine_tuned_model.answer}
                </ReactMarkdown>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Tài liệu tham chiếu:</p>
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 font-medium">
                  Không sử dụng tài liệu (Dễ bị ảo giác / Hallucination)
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Column */}
          <div className="w-full xl:w-80 flex flex-col gap-6">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">LLM-as-a-judge</h3>
              <pre className="text-xs whitespace-pre-wrap text-slate-600 dark:text-slate-300">{result.evaluation_score}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, rag, fineTuned, format, lowerIsBetter = false }: {
  title: string;
  rag: number;
  fineTuned: number;
  format: "score" | "percent" | "ms";
  lowerIsBetter?: boolean;
}) {
  const display = (value: number) => format === "percent" ? `${(value * 100).toFixed(0)}%` : format === "ms" ? `${value} ms` : value.toFixed(4);
  const ragWins = lowerIsBetter ? rag < fineTuned : rag > fineTuned;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">{title}</p>
      <div className={`flex justify-between text-sm mb-2 ${ragWins ? "font-bold text-indigo-600" : "text-slate-600"}`}><span>RAG</span><span>{display(rag)}</span></div>
      <div className={`flex justify-between text-sm ${!ragWins ? "font-bold text-purple-600" : "text-slate-600"}`}><span>Fine-tuned</span><span>{display(fineTuned)}</span></div>
    </div>
  );
}
