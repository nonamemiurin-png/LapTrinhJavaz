"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { CONFIG } from "@/lib/config";

export default function TokenSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const syncToken = async () => {
        try {
          const res = await fetch(`${CONFIG.API_BASE_URL}/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: session.user?.email,
              name: session.user?.name,
              image: session.user?.image,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              localStorage.setItem("backend_token", data.token);
            }
          }
        } catch (error) {
          console.error("Failed to sync token with backend:", error);
        }
      };

      syncToken();
    } else if (status === "unauthenticated") {
      localStorage.removeItem("backend_token");
    }
  }, [session, status]);

  // Optionally, you can wait for sync before rendering children, 
  // but to avoid blocking UI we can just render them.
  return <>{children}</>;
}
