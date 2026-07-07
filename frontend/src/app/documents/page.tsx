"use client";

import { useState, useEffect } from "react";

interface Document {
  id: number;
  filename: string;
  subject: string;
  chapter: string;
  uploadedAt: string;
  status: string;
  chunkStrategy: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [chunkStrategy, setChunkStrategy] = useState("fixed");

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error("Failed to fetch documents", e);
    }
  };

  useEffect(() => {
    // Fetching remote state on mount is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject);
    formData.append("chapter", chapter);
    formData.append("chunkStrategy", chunkStrategy);

    try {
      const res = await fetch("http://localhost:8080/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setFile(null);
        setSubject("");
        setChapter("");
        fetchDocuments();
      } else {
        alert("Upload failed.");
      }
    } catch (e) {
      console.error("Error uploading", e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-8 pb-10">
      <header className="pt-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý tài liệu môn học</h1>
        <p className="text-slate-500 mt-2">Tải lên slide bài giảng, file PDF/DOCX/PPTX/TXT để hệ thống tự động phân mảnh và Vector hóa.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            Tải tài liệu mới
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">File tài liệu</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-upload" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.docx,.pptx,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm text-slate-500">
                    {file ? file.name : "Kéo thả hoặc click để chọn file"}
                  </span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Môn học</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: Cấu trúc dữ liệu" 
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Chương / Chủ đề</label>
              <input 
                type="text" 
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="VD: Chương 1 - Tổng quan" 
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Chunking strategy</label>
              <select value={chunkStrategy} onChange={(e) => setChunkStrategy(e.target.value)} className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
                <option value="fixed">Fixed-size</option>
                <option value="semantic">Semantic</option>
                <option value="hierarchical">Hierarchical</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={!file || isUploading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl px-4 py-3 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xử lý...
                </>
              ) : "Upload & Vector hóa"}
            </button>
          </form>
        </div>

        {/* Document List */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-6">Tài liệu đã Index</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
                <tr>
                  <th className="w-[34%] px-4 py-3 rounded-l-lg">Tên file</th>
                  <th className="w-[24%] px-4 py-3">Môn học</th>
                  <th className="w-[18%] px-4 py-3">Chương</th>
                  <th className="w-[12%] px-4 py-3">Trạng thái</th>
                  <th className="w-[12%] px-4 py-3 rounded-r-lg">Ngày tải lên</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Chưa có tài liệu nào.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="bg-transparent border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex min-w-0 items-center gap-2" title={doc.filename}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-indigo-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span className="block min-w-0 truncate">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className="block truncate" title={doc.subject}>{doc.subject}</span></td>
                      <td className="px-4 py-4"><span className="block truncate" title={doc.chapter}>{doc.chapter}</span></td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          doc.status === 'PROCESSING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
