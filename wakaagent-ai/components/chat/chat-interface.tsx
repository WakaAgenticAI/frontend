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

interface Message {
  id: string
  type: "user" | "bot" | "system"
  content: string
  timestamp: Date
  hasAudio?: boolean
  audioUrl?: string
  transcript?: string
  hasMemory?: boolean
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (content: string, audioUrl?: string, transcript?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: transcript || content,
      timestamp: new Date(),
      hasAudio: !!audioUrl,
      audioUrl,
      transcript,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate bot response
    setIsTyping(true)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: generateBotResponse(content || transcript || ""),
        timestamp: new Date(),
        toolSuggestions: [
          { id: "create-order", label: "Create Order", action: "create_order", icon: ShoppingCart },
          { id: "check-stock", label: "Check Stock", action: "check_stock", icon: Package },
        ],
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 2000)
  }

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    if (lowerMessage.includes("order") || lowerMessage.includes("buy")) {
      return "I can help you create a new order. What products are you looking to purchase? I have access to our current inventory and can check availability in real-time."
    }
    if (lowerMessage.includes("stock") || lowerMessage.includes("inventory")) {
      return "Let me check our current stock levels for you. Which products are you interested in? I can also show you our AI-powered demand forecasts."
    }
    if (lowerMessage.includes("support") || lowerMessage.includes("help")) {
      return "I'd be happy to help! For complex issues, I can escalate you to our human support team. What specific assistance do you need?"
    }
    return "I understand you're asking about business operations. I can help with orders, inventory, customer management, and more. What would you like to focus on?"
  }

  const handleToolAction = (action: string) => {
    const actionMessages = {
      create_order: "I'll help you create a new order. Let me open the order creation wizard for you.",
      check_stock: "Let me check our current inventory levels and show you the latest stock information.",
      open_ticket: "I'm creating a support ticket and connecting you with our human support team.",
    }

    const systemMessage: Message = {
      id: Date.now().toString(),
      type: "system",
      content: actionMessages[action as keyof typeof actionMessages] || "Action executed successfully.",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, systemMessage])
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
                {isTyping && (
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
