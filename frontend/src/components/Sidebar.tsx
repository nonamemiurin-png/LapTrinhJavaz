import { signOut } from "next-auth/react";
import Image from "next/image";
import type { Session } from "next-auth";

interface SidebarProps {
  isSidebarOpen: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  session: Session | null;
}

export default function Sidebar({
  isSidebarOpen,
  activeView,
  setActiveView,
  session,
}: SidebarProps) {
  return (
    <aside
      className={`${
        isSidebarOpen ? "w-[280px]" : "w-0"
      } flex flex-col bg-[#FAFAFA] border-r border-slate-200/60 transition-all duration-300 overflow-hidden shrink-0 z-20`}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3 p-6 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white font-bold text-xl shadow-sm">
          R
        </div>
        <div>
          <div className="font-bold text-xl text-[#7C3AED] tracking-tight leading-tight">
            Chatbot AI Education
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Hệ thống Hỏi đáp
          </div>
        </div>
      </div>

      {/* Unified Navigation Tabs */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        <button
          onClick={() => setActiveView("documents")}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all ${
            activeView === "documents"
              ? "bg-white shadow-sm border border-slate-200/60 text-slate-800"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Quản lý tài liệu
        </button>

        <button
          onClick={() => setActiveView("chat")}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all ${
            activeView === "chat"
              ? "bg-white shadow-sm border border-slate-200/60 text-slate-800"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Chatbot Hỏi đáp
        </button>

        <button
          onClick={() => setActiveView("finetuning")}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all ${
            activeView === "finetuning"
              ? "bg-white shadow-sm border border-slate-200/60 text-slate-800"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Module Fine-Tuning
        </button>
      </div>

      {/* User Info */}
      <div className="p-6 pb-14">
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm relative group cursor-pointer hover:border-slate-200 transition-colors">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="User Avatar"
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-lg shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <div className="text-[14px] font-bold text-slate-800 truncate">
              {session?.user?.name || "Người dùng"}
            </div>
            <div className="text-[12px] text-slate-500 font-medium truncate">
              {session?.user?.email || "Email trống"}
            </div>
          </div>

          {/* Logout button (appears on hover) */}
          <div
            onClick={() => signOut()}
            className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500"
            title="Đăng xuất"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
