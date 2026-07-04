"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Citation {
  filename: string;
  subject: string;
  chapter: string;
  chunkId: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  citations?: Citation[];
  isLoading?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý học tập AI. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về nội dung các bài giảng đã được tải lên."
    }
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"RAG" | "Fine-tune">("Fine-tune");
  const [isModeOpen, setIsModeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const loadingMsg: Message = { id: "loading", role: "assistant", content: "", isLoading: true };
    
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: userMsg.content, 
          subject: subject || null,
          mode: mode === "RAG" ? "rag" : "finetune",
          sessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.filter(m => m.id !== "loading").concat({
          id: Date.now().toString(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          citations: data.citations
        }));
      } else {
        setMessages(prev => prev.filter(m => m.id !== "loading").concat({
          id: Date.now().toString(),
          role: "assistant",
          content: "Đã có lỗi xảy ra khi kết nối tới máy chủ."
        }));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== "loading").concat({
        id: Date.now().toString(),
        role: "assistant",
        content: "Không thể kết nối với hệ thống Backend."
      }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-3rem)] flex flex-col gap-4">
      <header className="flex items-center justify-between bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            Hỏi đáp Tài liệu (RAG)
          </h1>
          <p className="text-sm text-slate-500">Giới hạn kiến thức trong kho tài liệu môn học của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Lọc theo môn:</span>
          <input 
            type="text" 
            placeholder="Tất cả môn học..." 
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </header>

      <div className="flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm' 
                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
            }`}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  <span className="ml-2 text-sm">Đang suy nghĩ...</span>
                </div>
              ) : (
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
              
              {/* Nguồn trích dẫn (Sources) */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nguồn trích dẫn:</p>
                  <div className="flex flex-wrap gap-2">
                    {(msg.citations?.length ? msg.citations : msg.sources).map((src, idx) => (
                      <div key={idx} className="group relative">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium cursor-help border border-indigo-100 dark:border-indigo-800/50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          {typeof src === "string" ? src : `${src.filename} • ${src.subject} • ${src.chapter}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-3">
        <form onSubmit={handleSend} className="flex items-center relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
          <button type="button" className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Gõ câu hỏi về môn học..." 
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 px-2 text-sm sm:text-base w-full"
          />
          
          <div className="relative flex items-center" ref={dropdownRef}>
            <button 
               type="button" 
               onClick={() => setIsModeOpen(!isModeOpen)}
               className="flex items-center gap-1.5 px-4 py-2 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors mr-2 flex-shrink-0"
            >
               {mode}
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {isModeOpen && (
              <div className="absolute bottom-full right-0 mb-3 w-64 bg-[#1e1e1e] rounded-2xl shadow-xl overflow-hidden z-20 p-2 border border-slate-700">
                 <button type="button" onClick={() => { setMode('RAG'); setIsModeOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors flex justify-between items-center group">
                    <div>
                       <div className="text-white text-sm font-semibold">RAG Mode</div>
                       <div className="text-slate-400 text-[11px] mt-0.5">Truy xuất kiến thức từ tài liệu PDF</div>
                    </div>
                    {mode === 'RAG' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                 </button>
                 <button type="button" onClick={() => { setMode('Fine-tune'); setIsModeOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors flex justify-between items-center group">
                    <div>
                       <div className="text-white text-sm font-semibold">Fine-tune Mode</div>
                       <div className="text-slate-400 text-[11px] mt-0.5">Dùng kiến thức nội tại của LLM</div>
                    </div>
                    {mode === 'Fine-tune' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                 </button>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!input.trim()}
            className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-full p-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
