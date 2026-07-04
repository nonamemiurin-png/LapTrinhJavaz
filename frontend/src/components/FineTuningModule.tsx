"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CONFIG } from "@/lib/config";

interface FineTuningModuleProps {
  localModelEndpoint: string;
  setLocalModelEndpoint: (url: string) => void;
}

export default function FineTuningModule({
  localModelEndpoint,
  setLocalModelEndpoint,
}: FineTuningModuleProps) {
  const [ftModelName, setFtModelName] = useState("Qwen/Qwen2.5-0.5B-Instruct");
  const [ftDatasetName, setFtDatasetName] = useState("data/training_data.jsonl");
  const [ftLoraR, setFtLoraR] = useState(16);
  const [ftLoraAlpha, setFtLoraAlpha] = useState(32);
  const [ftEpochs, setFtEpochs] = useState(3);
  const [generatedScript, setGeneratedScript] = useState("");

  const handleGenerateScript = async () => {
    try {
      const token = localStorage.getItem("backend_token");
      const res = await fetch(`${CONFIG.API_BASE_URL}/finetuning/generate-script`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          modelName: ftModelName,
          datasetName: ftDatasetName,
          loraR: ftLoraR,
          loraAlpha: ftLoraAlpha,
          epochs: ftEpochs,
        }),
      });
      if (!res.ok) throw new Error("Lỗi API tạo script");
      
      const data = await res.json();
      setGeneratedScript(data.script);
      toast.success("Tạo script thành công!");
    } catch {
      toast.error("Lỗi khi tạo script!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pt-20 p-8 max-w-5xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">
        Module Fine-Tuning (PEFT/LoRA)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Configuration Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Cấu hình Hyperparameters
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Base Model (HuggingFace ID)
              </label>
              <input
                type="text"
                value={ftModelName}
                onChange={(e) => setFtModelName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Tên file Dataset (JSONL)
              </label>
              <input
                type="text"
                value={ftDatasetName}
                onChange={(e) => setFtDatasetName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  LoRA R
                </label>
                <input
                  type="number"
                  value={ftLoraR}
                  onChange={(e) => setFtLoraR(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  LoRA Alpha
                </label>
                <input
                  type="number"
                  value={ftLoraAlpha}
                  onChange={(e) => setFtLoraAlpha(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Epochs
                </label>
                <input
                  type="number"
                  value={ftEpochs}
                  onChange={(e) => setFtEpochs(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleGenerateScript}
                className="w-full py-3 bg-[#7C3AED] text-white font-medium rounded-xl hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Tạo Python Script (Colab)
              </button>
            </div>
          </div>
        </div>

        {/* Local Model Endpoint Config */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Tích hợp Local Model
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Sau khi Fine-tune trên Colab/GPU, bạn có thể tải Weights về máy và chạy thông qua Ollama hoặc vLLM. Khai báo API Endpoint tại đây để Chatbot gọi đến khi bật &quot;Fine-tune Mode&quot;.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Local Model Endpoint (REST API)
            </label>
            <input
              type="text"
              value={localModelEndpoint}
              onChange={(e) => setLocalModelEndpoint(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED] mb-2"
              placeholder="http://localhost:11434/api/generate"
            />
            <p className="text-xs text-slate-400">
              Ví dụ: http://localhost:11434/api/generate (Ollama Llama 3)
            </p>
          </div>
        </div>
      </div>

      {/* Generated Script Display */}
      {generatedScript && (
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-slate-800 px-6 py-3 flex items-center justify-between border-b border-slate-700">
            <span className="text-sm font-medium text-slate-300">
              train_peft.py
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedScript);
                toast.success("Đã copy script!");
              }}
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Copy Code
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">
              <code>{generatedScript}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
