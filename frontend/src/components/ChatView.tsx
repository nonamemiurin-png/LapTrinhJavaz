"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { CONFIG } from "@/lib/config";

interface ChatMessage {
  role: string;
  content: string;
  sources?: string[];
  citations?: Citation[];
}

interface Citation {
  filename: string;
  subject: string;
  chapter: string;
  chunkId: string;
}

interface ChatViewProps {
  chatSubjectFilter: string;
  setChatSubjectFilter: (filter: string) => void;
  localModelEndpoint: string;
}

export default function ChatView({
  chatSubjectFilter,
  setChatSubjectFilter,
  localModelEndpoint,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("RAG Mode");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChatUploading, setIsChatUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsChatUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", file.name); // Sử dụng tên file làm subject
    formData.append("chapter", "Chat Upload");

    const toastId = toast.loading("Đang đính kèm tài liệu...");

    try {
      const token = localStorage.getItem("backend_token");
      const res = await fetch(`${CONFIG.API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (res.ok) {
        setChatSubjectFilter(file.name);
        toast.success("Đã đính kèm tài liệu thành công!", { id: toastId });
      } else {
        toast.error("Lỗi khi đính kèm tài liệu!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối đến server!", { id: toastId });
    } finally {
      setIsChatUploading(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    const currentInput = inputValue;
    const currentMode = selectedModel;

    setMessages((prev) => [...prev, { role: "user", content: currentInput }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("backend_token");
      const response = await fetch(`${CONFIG.API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: currentInput,
          mode: currentMode.toLowerCase().includes("fine") ? "finetuned" : "rag",
          sessionId,
          subject: chatSubjectFilter,
          localModelEndpoint: localModelEndpoint,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.answer || "Không nhận được phản hồi từ hệ thống.",
          sources: data.sources || [],
          citations: data.citations || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: `**[Lỗi hệ thống]** API Backend không phản hồi. Vui lòng kiểm tra server.\n\nChi tiết: ${error}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto w-full relative bg-white">
      <input
        type="file"
        ref={chatFileInputRef}
        onChange={handleChatFileUpload}
        className="hidden"
        accept=".pdf,.docx,.pptx,.txt"
      />
      
      {messages.length === 0 ? (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-8 tracking-tight text-center">
            Trợ lý Hỏi đáp Chatbot AI Education
          </h1>

          {/* Input Area */}
          {chatSubjectFilter && (
            <div className="w-full max-w-3xl mb-3 flex justify-start">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-sm font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                Lọc theo môn: {chatSubjectFilter}
                <button
                  onClick={() => setChatSubjectFilter("")}
                  className="ml-1 hover:bg-indigo-200 p-0.5 rounded-full transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="w-full relative bg-white shadow-lg shadow-slate-200/50 rounded-3xl border border-slate-200/80 p-1 transition-all focus-within:border-[#7C3AED]/30">
            <div className="flex items-end px-4 py-3 gap-3">
              <button
                onClick={() => chatFileInputRef.current?.click()}
                disabled={isChatUploading || isTyping}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Đính kèm tài liệu"
              >
                {isChatUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-slate-500"></div>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                )}
              </button>
              
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
                placeholder="Gõ câu hỏi về môn học..."
                className="flex-1 max-h-40 min-h-[44px] resize-none outline-none py-2 text-[16px] bg-transparent text-slate-800 placeholder:text-slate-400 overflow-y-auto"
                rows={1}
              />

              {/* Model Switcher Dropdown */}
              <div className="relative flex items-center justify-center">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-full transition-colors mr-2"
                >
                  {selectedModel === "RAG Mode" ? "RAG" : "Fine-tune"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-3 w-64 bg-[#1E1E1E] text-white rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 border border-slate-700">
                    <button
                      onClick={() => { setSelectedModel("RAG Mode"); setIsDropdownOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-left group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">RAG Mode</div>
                        <div className="text-xs text-slate-400 mt-0.5">Truy xuất kiến thức từ tài liệu PDF</div>
                      </div>
                      {selectedModel === "RAG Mode" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </button>
                    <button
                      onClick={() => { setSelectedModel("Fine-tuning Mode"); setIsDropdownOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-left group mt-1"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">Fine-tune Mode</div>
                        <div className="text-xs text-slate-400 mt-0.5">Dùng kiến thức nội tại của LLM</div>
                      </div>
                      {selectedModel === "Fine-tuning Mode" && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center ${inputValue.trim() && !isTyping ? 'bg-black text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400'}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Active Chat State
        <div className="flex-1 flex flex-col w-full relative">
          <div className="flex-1 overflow-y-auto w-full pt-16 pb-40">
            <div className="max-w-3xl mx-auto w-full flex flex-col space-y-8 px-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shrink-0 mr-4 shadow-sm font-bold">
                      R
                    </div>
                  )}
                  <div className={`max-w-[85%] leading-relaxed ${msg.role === 'user'
                      ? 'bg-slate-100 text-slate-800 px-6 py-3.5 rounded-3xl rounded-tr-sm'
                      : 'text-slate-800 py-1 text-[16px] markdown-content'
                    }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    {msg.role === 'bot' && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
                        <div className="font-semibold mb-1">Nguồn tham khảo</div>
                        {msg.citations && msg.citations.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((citation) => (
                              <span key={citation.chunkId} className="px-2 py-1 rounded bg-indigo-50 text-indigo-700">
                                {citation.filename} • {citation.subject} • {citation.chapter}
                              </span>
                            ))}
                          </div>
                        ) : msg.sources.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shrink-0 mr-4 shadow-sm font-bold">
                    R
                  </div>
                  <div className="bg-slate-50 text-slate-500 px-6 py-4 rounded-3xl rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input at Bottom */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-8">
            <div className="max-w-3xl mx-auto px-6 w-full">
              {chatSubjectFilter && (
                <div className="w-full mb-3 flex justify-start">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-sm font-medium shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    Lọc theo môn: {chatSubjectFilter}
                    <button
                      onClick={() => setChatSubjectFilter("")}
                      className="ml-1 hover:bg-indigo-200 p-0.5 rounded-full transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              )}
              
              <div className="w-full relative bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.03)] rounded-3xl border border-slate-200/80 p-1">
                <div className="flex items-end px-3 py-2 gap-3">
                  <button
                    onClick={() => chatFileInputRef.current?.click()}
                    disabled={isChatUploading || isTyping}
                    className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Đính kèm tài liệu"
                  >
                    {isChatUploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-slate-500"></div>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    )}
                  </button>
                  
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isTyping}
                    placeholder="Gõ câu hỏi về môn học..."
                    className="flex-1 max-h-40 min-h-[44px] resize-none outline-none py-3 text-[16px] bg-transparent text-slate-800 placeholder:text-slate-400 overflow-y-auto"
                    rows={1}
                  />

                  {/* Model Switcher Dropdown for active chat */}
                  <div className="relative flex items-center justify-center">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-full transition-colors mr-2"
                    >
                      {selectedModel === "RAG Mode" ? "RAG" : "Fine-tune"}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute bottom-full right-0 mb-3 w-64 bg-[#1E1E1E] text-white rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 border border-slate-700">
                        <button
                          onClick={() => { setSelectedModel("RAG Mode"); setIsDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-left group"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">RAG Mode</div>
                            <div className="text-xs text-slate-400 mt-0.5">Truy xuất kiến thức từ tài liệu PDF</div>
                          </div>
                          {selectedModel === "RAG Mode" && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                        </button>
                        <button
                          onClick={() => { setSelectedModel("Fine-tuning Mode"); setIsDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-left group mt-1"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">Fine-tune Mode</div>
                            <div className="text-xs text-slate-400 mt-0.5">Dùng kiến thức nội tại của LLM</div>
                          </div>
                          {selectedModel === "Fine-tuning Mode" && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className={`p-2.5 rounded-full transition-all flex items-center justify-center ${inputValue.trim() && !isTyping ? 'bg-black text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400'}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
