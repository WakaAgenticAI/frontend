"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  HeadphonesIcon,
  Settings,
  Menu,
  Bell,
  Search,
  Globe,
  User,
  ChevronsLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import Dashboard from "@/components/dashboard"
import { ChatInterface } from "@/components/chat/chat-interface"
import { OrdersInterface } from "@/components/orders/orders-interface"
import { CRMInterface } from "@/components/crm/crm-interface"
import { InventoryInterface } from "@/components/inventory/inventory-interface"
import { FinanceInterface } from "@/components/finance/finance-interface"
import { SupportInterface } from "@/components/support/support-interface"
import AdminInterface from "@/components/admin/admin-interface"
import { SettingsInterface } from "@/components/settings/settings-interface"

const navigation = [
  { name: "Dashboard", key: "dashboard", icon: LayoutDashboard },
  { name: "Chat", key: "chat", icon: MessageSquare, badge: "3" },
  { name: "Orders", key: "orders", icon: ShoppingCart },
  { name: "CRM", key: "crm", icon: Users },
  { name: "Inventory", key: "inventory", icon: Package, badge: "!" },
  { name: "Finance", key: "finance", icon: DollarSign },
  { name: "Support", key: "support", icon: HeadphonesIcon },
  { name: "Settings", key: "settings", icon: Settings },
  { name: "Admin", key: "admin", icon: Settings },
]

interface AppShellProps {
  children?: React.ReactNode
  currentView?: string
  onViewChange?: (view: string) => void
}

export function AppShell({ children, currentView = "dashboard", onViewChange }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(false)

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed")
    if (saved !== null) setCollapsed(saved === "true")
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", String(collapsed))
    } catch (_) {}
  }, [collapsed])

  const handleNavigation = (key: string) => {
    onViewChange?.(key)
    setSidebarOpen(false)
  }

  const renderCurrentView = () => {
    if (children) return children

    switch (currentView) {
      case "dashboard":
        return <Dashboard />
      case "chat":
        return <ChatInterface />
      case "orders":
        return <OrdersInterface />
      case "crm":
        return <CRMInterface />
      case "inventory":
        return <InventoryInterface />
      case "finance":
        return <FinanceInterface />
      case "support":
        return <SupportInterface />
      case "settings":
        return <SettingsInterface />
      case "admin":
        return <AdminInterface />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 ${collapsed ? "w-16" : "w-64"} bg-sidebar transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/wakaagent-logo.png" alt="WakaAgent AI Logo" width={32} height={32} className="h-8 w-8" />
              <span className={`text-lg font-bold text-sidebar-foreground font-sans transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"}`}>WakaAgent AI</span>
            </Link>
            <Button variant="ghost" size="icon" className="ml-auto hidden lg:inline-flex" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
              <ChevronsLeft className={`h-5 w-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isCurrent = currentView === item.key
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.key)}
                  className={`${
                    isCurrent
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
                  } group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"}`}>
                      {item.name}
                    </span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.badge === "!" ? "destructive" : "secondary"}
                      className={`h-5 ${collapsed ? "w-0 p-0 opacity-0" : "w-5 p-0 opacity-100"} rounded-full text-xs transition-all duration-300`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
              <Input
                className="pl-10 w-full max-w-lg"
                placeholder="Search orders, customers, products..."
                type="search"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-accent text-accent-foreground">
                3
              </Badge>
            </Button>

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Naija Pidgin</DropdownMenuItem>
                <DropdownMenuItem>Hausa</DropdownMenuItem>
                <DropdownMenuItem>Yoruba</DropdownMenuItem>
                <DropdownMenuItem>Igbo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewChange?.("dashboard")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange?.("settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{renderCurrentView()}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
