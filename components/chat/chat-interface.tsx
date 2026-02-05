"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, User, Bot, ShoppingCart, Package, HeadphonesIcon, Brain, Clock } from "lucide-react"
import { AudioRecorder } from "./audio-recorder"
import { AudioPlayer } from "./audio-player"
import { ToolSuggestions } from "./tool-suggestions"
import { LanguageSelector } from "./language-selector"
import { createChatSession, executeTool, sendChatMessage, aiComplete, aiCompleteStream, aiMultilingual, aiClassifyIntent } from "@/lib/api"
import { connectChat, joinChatSession } from "@/lib/realtime"

interface Message {
  id: string
  type: "user" | "bot" | "system"
  content: string
  timestamp: Date
  hasAudio?: boolean
  audioUrl?: string
  transcript?: string
  hasMemory?: boolean
  detectedLanguage?: string
  confidence?: number
  intent?: string
  agent?: string
  toolSuggestions?: Array<{
    id: string
    label: string
    action: string
    icon: any
  }>
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "system",
    content: "Welcome to WakaAgent AI! I'm here to help you manage your business. You can type or use voice messages.",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "2",
    type: "bot",
    content: "I remember your last order for iPhone 15 Pro was delivered successfully. How can I assist you today?",
    timestamp: new Date(Date.now() - 30000),
    hasMemory: true,
    toolSuggestions: [
      { id: "create-order", label: "Create Order", action: "create_order", icon: ShoppingCart },
      { id: "check-stock", label: "Check Stock", action: "check_stock", icon: Package },
      { id: "open-ticket", label: "Get Support", action: "open_ticket", icon: HeadphonesIcon },
    ],
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const socketRef = useRef<ReturnType<typeof connectChat> | null>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Initialize chat session and realtime
  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        const sess = await createChatSession(true)
        if (!mounted) return
        setSessionId(sess.id)
        // Derive backend base (origin) from API base so WS host/port match the REST API
        // e.g., API_BASE=http://127.0.0.1:8002/api/v1 -> backendBase=http://127.0.0.1:8002
        const { API_BASE } = await import("@/lib/api")
        const backendBase = new URL(API_BASE).origin
        const sock = connectChat(backendBase)
        socketRef.current = sock
        sock.on("connect", () => {
          if (sess.id) joinChatSession(sock, sess.id)
        })
        sock.on("chat.message", (evt: any) => {
          // Append messages from server
          const m: Message = {
            id: String(evt.id ?? Date.now()),
            type: evt.role === "agent" ? "bot" : (evt.role === "user" ? "user" : "system"),
            content: evt.content ?? "",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, m])
          if (m.type === "bot") setIsTyping(false)
        })
        sock.on("chat.kb_suggestions", (evt: any) => {
          // Present KB suggestions as a bot system message
          const items = evt?.items || []
          const m: Message = {
            id: String(Date.now()),
            type: "system",
            content: `Found related docs: ${items.map((x: any) => x?.metadata?.title || "doc").join(", ")}`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, m])
        })
      } catch (e) {
        // ignore
      }
    }
    init()
    return () => {
      mounted = false
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  const handleSendMessage = async (content: string, audioUrl?: string, transcript?: string) => {
    const messageContent = transcript || content
    
    // Classify intent first
    let intentResult = null
    try {
      intentResult = await aiClassifyIntent({
        message: messageContent,
        context: { user_type: "customer", session_id: sessionId }
      })
    } catch (e) {
      console.warn('Intent classification failed:', e)
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
      hasAudio: !!audioUrl,
      audioUrl,
      transcript,
      intent: intentResult?.intent,
      agent: intentResult?.agent,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Handle multilingual processing if not English
    if (selectedLanguage !== "en") {
      try {
        setIsTyping(true)
        const multilingualResult = await aiMultilingual({
          message: messageContent,
          context: "customer_service"
        })
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: multilingualResult.response,
          timestamp: new Date(),
          detectedLanguage: multilingualResult.detected_language,
          confidence: multilingualResult.confidence,
        }
        
        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
        return
      } catch (e) {
        console.error('Multilingual processing failed:', e)
        setIsTyping(false)
      }
    }

    // Use AI completion for enhanced responses
    if (sessionId) {
      try {
        setIsTyping(true)
        setIsStreaming(true)
        
        // Try streaming first, fallback to regular completion
        try {
          const streamingResponse = aiCompleteStream({
            prompt: messageContent,
            session_id: sessionId,
            temperature: 0.7,
            max_tokens: 500,
            language: selectedLanguage
          })
          
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: "",
            timestamp: new Date(),
          }
          
          setMessages((prev) => [...prev, botMessage])
          
          // Stream the response
          for await (const chunk of streamingResponse) {
            setMessages((prev) => {
              const updated = [...prev]
              const lastMessage = updated[updated.length - 1]
              if (lastMessage.type === "bot" && lastMessage.id === botMessage.id) {
                lastMessage.content += chunk
              }
              return updated
            })
          }
          
          setIsStreaming(false)
        } catch (streamError) {
          // Fallback to regular completion
          const response = await aiComplete({
            prompt: messageContent,
            session_id: sessionId,
            temperature: 0.7,
            max_tokens: 500,
            language: selectedLanguage
          })
          
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: response.content,
            timestamp: new Date(),
          }
          
          setMessages((prev) => [...prev, botMessage])
          setIsStreaming(false)
        }
        
        setIsTyping(false)
      } catch (e) {
        console.error('AI completion failed:', e)
        setIsTyping(false)
        setIsStreaming(false)
        
        // Fallback to original chat message
        try {
          await sendChatMessage(sessionId, messageContent)
        } catch (fallbackError) {
          console.error('Fallback chat message failed:', fallbackError)
        }
      }
    }
  }

  // remove static generator; replies come from backend

  const handleToolAction = async (action: string) => {
    const labelMap: Record<string, string> = {
      create_order: "orders.create",
      check_stock: "inventory.check",
      open_ticket: "support.open",
    }
    const intent = labelMap[action] || action
    try {
      const res = await executeTool(intent, {})
      const m: Message = {
        id: Date.now().toString(),
        type: "system",
        content: `Executed ${intent}: ${JSON.stringify(res)}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, m])
    } catch (e: any) {
      const m: Message = {
        id: Date.now().toString(),
        type: "system",
        content: `Failed to execute ${intent}: ${e?.message || e}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, m])
    }
  }

  const handleEscalateToSupport = () => {
    const escalationMessage: Message = {
      id: Date.now().toString(),
      type: "system",
      content:
        "Escalating to human support... A support ticket has been created and you'll be connected with an agent shortly.",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, escalationMessage])
  }

  return (
    <div className="flex h-full">
      {/* Chat Thread */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-sans">AI Assistant</span>
              <Badge variant="outline" className="ml-auto bg-chart-4/10 text-chart-4 border-chart-4">
                Online
              </Badge>
            </CardTitle>
            <div className="flex items-center justify-between mt-2">
              <LanguageSelector 
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
              {isStreaming && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  Streaming...
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {message.hasMemory && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-accent/10 rounded-lg px-3 py-2 mb-2">
                        <Brain className="h-3 w-3 text-accent" />
                        <span>I remember your previous interactions...</span>
                      </div>
                    )}
                    <div
                      className={`flex ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      } ${message.type === "system" ? "justify-center" : ""}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.type === "bot"
                              ? "bg-secondary/10 text-foreground border border-secondary/20"
                              : "bg-muted text-muted-foreground text-sm"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "user" && <User className="h-4 w-4 mt-0.5 shrink-0" />}
                          {message.type === "bot" && <Bot className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />}
                          <div className="flex-1">
                            <p className="text-sm font-serif">{message.content}</p>
                            {message.hasAudio && message.audioUrl && (
                              <div className="mt-2">
                                <AudioPlayer audioUrl={message.audioUrl} />
                                {message.transcript && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    Transcript: {message.transcript}
                                  </p>
                                )}
                              </div>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {message.detectedLanguage && message.detectedLanguage !== 'en' && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {message.detectedLanguage} ({Math.round((message.confidence || 0) * 100)}%)
                                  </Badge>
                                </>
                              )}
                              {message.intent && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {message.intent}
                                  </Badge>
                                </>
                              )}
                              {message.agent && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {message.agent}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {message.toolSuggestions && (
                          <div className="mt-3 pt-2 border-t border-border/50">
                            <ToolSuggestions suggestions={message.toolSuggestions} onAction={handleToolAction} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(isTyping || isStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/10 text-foreground border border-secondary/20 rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-secondary" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {isStreaming ? "Streaming response..." : "Thinking..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Input Area */}
            <div className="p-4 space-y-3">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message or use voice..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && inputValue.trim()) {
                        handleSendMessage(inputValue.trim())
                      }
                    }}
                    className="resize-none"
                  />
                </div>
                <AudioRecorder
                  onRecordingComplete={handleSendMessage}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                />
                <Button
                  onClick={() => handleSendMessage(inputValue.trim())}
                  disabled={!inputValue.trim() || isRecording}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Press Enter to send • Click mic for voice message</span>
                <Button variant="link" size="sm" onClick={handleEscalateToSupport} className="h-auto p-0 text-xs">
                  Talk to human support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
