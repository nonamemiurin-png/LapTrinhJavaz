import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Chatbot RBL - Hỗ trợ sinh viên",
  description: "Hệ thống hỏi đáp tài liệu môn học và thực nghiệm RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="overflow-x-hidden font-sans">
        <SessionProviderWrapper>
          <Toaster position="top-right" />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
