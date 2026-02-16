"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { LoginForm } from "@/components/auth/login-form"

export default function DashboardRoute() {
  const [currentView, setCurrentView] = useState<string>("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check if user has access token
    const token = localStorage.getItem("access_token")
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    setIsAuthenticated(false)
    setCurrentView("dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <AppShell currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
}
