"use client";

import { useEffect, useState } from "react";
import { getChatHistory } from "@/services/chatService";
import type { ChatHistory } from "@/types/chatHistory";

export function useChatHistory() {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      const result = await getChatHistory();
      setChats(result as ChatHistory[]);
      setLoading(false);
    }

    loadChats();
  }, []);

  return { chats, loading };
}