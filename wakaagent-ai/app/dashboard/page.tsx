"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"

export default function DashboardRoute() {
  const [currentView, setCurrentView] = useState<string>("dashboard")
  return <AppShell currentView={currentView} onViewChange={setCurrentView} />
}
