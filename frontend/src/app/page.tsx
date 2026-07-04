"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import DocumentManager from "@/components/DocumentManager";
import FineTuningModule from "@/components/FineTuningModule";

export default function Home() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("chat"); // documents, chat, finetuning
  const [chatSubjectFilter, setChatSubjectFilter] = useState("");
  const [localModelEndpoint, setLocalModelEndpoint] = useState(
    "http://localhost:11434/api/generate"
  );

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7C3AED]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB] text-slate-800">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-sm">
            R
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
            Chào mừng đến Chatbot AI Education
          </h1>
          <p className="text-slate-500 mb-8 font-medium">
            Hệ thống trợ lý AI học tập thông minh.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-sm mb-3"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Đăng nhập bằng Google
          </button>

          <button
            onClick={() => signIn("credentials")}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            Đăng nhập Test (Không cần Google)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full font-sans bg-[#F9FAFB] text-slate-800">
      {/* Sidebar Component */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        session={session}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full bg-white">
        {/* Toggle Sidebar Button */}
        <div className="flex items-center p-4 absolute top-0 left-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Dynamic Views */}
        {activeView === "chat" && (
          <ChatView
            chatSubjectFilter={chatSubjectFilter}
            setChatSubjectFilter={setChatSubjectFilter}
            localModelEndpoint={localModelEndpoint}
          />
        )}
        {activeView === "documents" && (
          <DocumentManager
            setActiveView={setActiveView}
            setChatSubjectFilter={setChatSubjectFilter}
          />
        )}
        {activeView === "finetuning" && (
          <FineTuningModule
            localModelEndpoint={localModelEndpoint}
            setLocalModelEndpoint={setLocalModelEndpoint}
          />
        )}
      </main>
    </div>
  );
}
