"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { CONFIG } from "@/lib/config";

interface DocumentManagerProps {
  setActiveView: (view: string) => void;
  setChatSubjectFilter: (subject: string) => void;
}

interface IndexedDocument {
  id: number;
  filename: string;
  subject: string;
  chapter: string;
  status: string;
  uploadedAt: string;
  chunkStrategy: string;
}

export default function DocumentManager({ setActiveView, setChatSubjectFilter }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSubject, setUploadSubject] = useState("Nhập môn AI");
  const [uploadChapter, setUploadChapter] = useState("Chương 1");
  const [chunkStrategy, setChunkStrategy] = useState("fixed");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchDocuments() {
    try {
      const token = localStorage.getItem("backend_token");
      const res = await fetch(`${CONFIG.API_BASE_URL}/documents`, {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        }
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      console.error("Lỗi lấy danh sách tài liệu:", e);
      toast.error("Không thể tải danh sách tài liệu!");
    }
  }

  useEffect(() => {
    // Fetching remote state on mount is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDocuments();
  }, []);

  const handleDeleteDocument = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này? Mọi dữ liệu và Vector liên quan sẽ bị xóa khỏi Database.")) return;

    try {
      const token = localStorage.getItem("backend_token");
      const res = await fetch(`${CONFIG.API_BASE_URL}/documents/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        }
      });
      if (res.ok) {
        await fetchDocuments();
        toast.success("Đã xóa tài liệu thành công!");
      } else {
        toast.error("Lỗi khi xóa tài liệu!");
      }
    } catch {
      toast.error("Lỗi kết nối đến server!");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", uploadSubject);
    formData.append("chapter", uploadChapter);
    formData.append("chunkStrategy", chunkStrategy);

    const toastId = toast.loading("Đang tải lên và xử lý tài liệu...");

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
        await fetchDocuments();
        toast.success("Tải lên và xử lý tài liệu thành công!", { id: toastId });
      } else {
        toast.error("Lỗi khi tải tài liệu!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối đến server!", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pt-20 p-8 max-w-5xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">Quản lý Tài liệu</h2>

      {/* Upload Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Upload Tài liệu mới</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Môn học</label>
            <input type="text" value={uploadSubject} onChange={e => setUploadSubject(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]" placeholder="Nhập môn học..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Chunking strategy</label>
            <select value={chunkStrategy} onChange={e => setChunkStrategy(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]">
              <option value="fixed">Fixed-size</option>
              <option value="semantic">Semantic</option>
              <option value="hierarchical">Hierarchical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Chương</label>
            <input type="text" value={uploadChapter} onChange={e => setUploadChapter(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED]" placeholder="Nhập chương..." />
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.pptx,.txt" />
        <div onClick={() => fileInputRef.current?.click()} className={`bg-[#FAFAFA] border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50'}`}>
          <div className="w-12 h-12 bg-white shadow-sm text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-200">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#7C3AED]"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            )}
          </div>
          <p className="text-slate-700 font-semibold mb-1">{isUploading ? 'Đang tải lên và xử lý Vector...' : 'Chọn tài liệu (PDF, DOCX, PPTX)'}</p>
          <p className="text-slate-500 text-sm">Hệ thống sẽ tự động chunk và embed vào CSDL</p>
        </div>
      </div>

      {/* List Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Tài liệu đã Index</h3>
        {documents.length === 0 ? (
          <p className="text-slate-500">Chưa có tài liệu nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-3 font-medium">Tên File</th>
                  <th className="py-3 font-medium">Môn học</th>
                  <th className="py-3 font-medium">Chương</th>
                  <th className="py-3 font-medium">Chunking</th>
                  <th className="py-3 font-medium">Trạng thái</th>
                  <th className="py-3 font-medium">Ngày tải lên</th>
                  <th className="py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 text-slate-700 text-sm hover:bg-slate-50">
                    <td className="py-3 font-medium">{doc.filename}</td>
                    <td className="py-3">{doc.subject}</td>
                    <td className="py-3">{doc.chapter}</td>
                    <td className="py-3 capitalize">{doc.chunkStrategy || "fixed"}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doc.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : doc.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(doc.uploadedAt).toLocaleString('vi-VN')}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setChatSubjectFilter(doc.subject);
                              setActiveView("chat");
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                            title="Chuyển sang hỏi đáp tài liệu này"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Hỏi đáp
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="inline-flex items-center justify-center p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                          title="Xóa tài liệu"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
