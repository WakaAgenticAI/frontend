"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { LoginForm } from "@/components/auth/login-form"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState("dashboard")

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />
  }

  return <AppShell currentView={currentView} onViewChange={setCurrentView} />
}
