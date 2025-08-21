"use client"

import { AppShell } from "@/components/app-shell"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  return (
    <AppShell>
      <div className="h-full p-6">
        <div className="h-full max-w-4xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </AppShell>
  )
}
